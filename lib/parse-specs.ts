import {
  NAME_ALIASES,
  PARTS,
  PART_IDS,
  type Build,
  type PartId,
} from "./build"

export type ParseResult = {
  name?: string
  parts: Partial<Record<PartId, string>>
  unmatched: string[]
  error?: string
}

type AliasTarget = PartId | "name"

const SUFFIXES = new Set(["name", "model", "brand", "info", "spec", "specs"])

const ALIAS_TO_TARGET = new Map<string, AliasTarget>()

for (const part of PARTS) {
  for (const alias of part.aliases) {
    ALIAS_TO_TARGET.set(alias, part.id)
  }
}

for (const alias of NAME_ALIASES) {
  ALIAS_TO_TARGET.set(alias, "name")
}

const ALIASES_BY_LENGTH = [...ALIAS_TO_TARGET.keys()].sort(
  (a, b) => b.length - a.length,
)

function normalizeKey(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9.+]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function resolveAlias(raw: string): AliasTarget | null {
  const key = normalizeKey(raw)
  if (!key) return null
  const exact = ALIAS_TO_TARGET.get(key)
  if (exact) return exact

  for (const alias of ALIASES_BY_LENGTH) {
    if (!key.startsWith(`${alias} `)) continue
    const rest = key.slice(alias.length + 1)
    const words = rest.split(" ")
    if (words.every((word) => SUFFIXES.has(word))) {
      return ALIAS_TO_TARGET.get(alias) ?? null
    }
  }

  return null
}

function stripDecorations(line: string): string {
  return line
    .replace(/^\s*[-*•]\s+/, "")
    .replace(/^\s*\d+[.)]\s+/, "")
    .trim()
}

function splitLabeledLine(line: string): { key: string; value: string } | null {
  const separated = line.match(/^(.+?)\s*(?::|=|\|)\s*(.*)$/)
  if (separated) {
    return { key: separated[1].trim(), value: separated[2].trim() }
  }

  const dashed = line.match(/^([A-Za-z][A-Za-z0-9 .+/]{0,40}?)\s+[-–—]\s+(.+)$/)
  if (dashed) {
    return { key: dashed[1].trim(), value: dashed[2].trim() }
  }

  const lower = line.toLowerCase()
  for (const alias of ALIASES_BY_LENGTH) {
    if (!lower.startsWith(alias)) continue
    const after = line.slice(alias.length)
    if (after.includes(":")) continue
    if (after.length > 0 && !/^[\s\-–—]/.test(after)) continue
    return {
      key: line.slice(0, alias.length),
      value: after.replace(/^[\s\-–—]+/, "").trim(),
    }
  }

  return null
}

function assignPart(
  parts: Partial<Record<PartId, string>>,
  id: PartId,
  value: string,
) {
  const previous = parts[id]
  if (previous && value && previous !== value) {
    parts[id] = `${previous} · ${value}`
    return
  }
  parts[id] = value
}

function parseJson(text: string): ParseResult {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return {
      parts: {},
      unmatched: [],
      error: "That text starts with { but is not valid JSON.",
    }
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {
      parts: {},
      unmatched: [],
      error: "JSON needs a build name or at least one known part.",
    }
  }

  const record = data as Record<string, unknown>
  const nested =
    record.parts && typeof record.parts === "object" && !Array.isArray(record.parts)
      ? (record.parts as Record<string, unknown>)
      : null
  const source = nested ?? record
  const parts: Partial<Record<PartId, string>> = {}

  for (const id of PART_IDS) {
    if (typeof source[id] === "string") parts[id] = source[id]
  }

  const name =
    typeof record.name === "string" && record.name.trim()
      ? record.name.trim()
      : undefined

  if (!name && Object.keys(parts).length === 0) {
    return {
      parts: {},
      unmatched: [],
      error: "JSON needs a build name or at least one known part.",
    }
  }

  const unmatched: string[] = []
  for (const key of Object.keys(record)) {
    if (key === "name" || key === "parts") continue
    if (nested || !PART_IDS.includes(key as PartId)) {
      unmatched.push(`Unknown field: ${key}`)
    }
  }
  if (nested) {
    for (const key of Object.keys(nested)) {
      if (!PART_IDS.includes(key as PartId)) {
        unmatched.push(`Unknown field: ${key}`)
      }
    }
  }

  return { name, parts, unmatched }
}

export function parseSpecList(text: string): ParseResult {
  const trimmed = text.trim()
  if (!trimmed) {
    return { parts: {}, unmatched: [], error: "Paste a few lines first." }
  }
  if (trimmed.startsWith("{")) return parseJson(trimmed)

  const parts: Partial<Record<PartId, string>> = {}
  let name: string | undefined
  const unmatched: string[] = []

  for (const rawLine of text.split(/\r?\n/)) {
    const line = stripDecorations(rawLine)
    if (!line || line.startsWith("#")) continue

    const labeled = splitLabeledLine(line)
    if (!labeled) {
      unmatched.push(rawLine.trim())
      continue
    }

    const target = resolveAlias(labeled.key)
    if (!target) {
      unmatched.push(rawLine.trim())
      continue
    }

    if (target === "name") {
      if (labeled.value) name = labeled.value
      continue
    }

    assignPart(parts, target, labeled.value)
  }

  return { name, parts, unmatched }
}

export function applyParseResult(build: Build, result: ParseResult): Build {
  return {
    name: result.name?.trim() ? result.name.trim() : build.name,
    parts: { ...build.parts, ...result.parts },
  }
}
