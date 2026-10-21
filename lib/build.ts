export const PART_IDS = [
  "cpu",
  "cooler",
  "motherboard",
  "gpu",
  "ram",
  "storage",
  "psu",
  "case",
  "monitor",
  "keyboard",
  "mouse",
  "headset",
  "microphone",
] as const

export type PartId = (typeof PART_IDS)[number]

export type PartGroup = "audio" | "desk" | "case"

export type PartDef = {
  id: PartId
  label: string
  short: string
  group: PartGroup
  placeholder: string
  aliases: readonly string[]
}

export const PARTS: readonly PartDef[] = [
  {
    id: "cpu",
    label: "Processor",
    short: "CPU",
    group: "case",
    placeholder: "Name the processor",
    aliases: ["cpu", "processor"],
  },
  {
    id: "cooler",
    label: "Cooler",
    short: "Cooler",
    group: "case",
    placeholder: "Air tower or liquid cooler",
    aliases: ["cooler", "aio", "cpu cooler", "liquid cooler"],
  },
  {
    id: "motherboard",
    label: "Motherboard",
    short: "Board",
    group: "case",
    placeholder: "Motherboard",
    aliases: ["motherboard", "mobo", "mainboard"],
  },
  {
    id: "gpu",
    label: "Graphics card",
    short: "GPU",
    group: "case",
    placeholder: "Graphics card",
    aliases: ["gpu", "graphics", "graphics card", "video card", "gfx"],
  },
  {
    id: "ram",
    label: "Memory",
    short: "Memory",
    group: "case",
    placeholder: "Memory kit",
    aliases: ["ram", "memory", "dram"],
  },
  {
    id: "storage",
    label: "Storage",
    short: "Storage",
    group: "case",
    placeholder: "SSD or drive",
    aliases: [
      "storage",
      "ssd",
      "nvme",
      "nvme ssd",
      "hdd",
      "drive",
      "hard drive",
      "m.2",
      "m2",
      "m.2 ssd",
    ],
  },
  {
    id: "psu",
    label: "Power supply",
    short: "Power",
    group: "case",
    placeholder: "Power supply",
    aliases: ["psu", "power supply", "power supply unit"],
  },
  {
    id: "case",
    label: "Case",
    short: "Case",
    group: "case",
    placeholder: "Case",
    aliases: ["case", "chassis", "tower"],
  },
  {
    id: "monitor",
    label: "Monitor",
    short: "Display",
    group: "desk",
    placeholder: "Monitor",
    aliases: ["monitor", "display", "screen"],
  },
  {
    id: "keyboard",
    label: "Keyboard",
    short: "Keyboard",
    group: "desk",
    placeholder: "Keyboard",
    aliases: ["keyboard", "kb"],
  },
  {
    id: "mouse",
    label: "Mouse",
    short: "Mouse",
    group: "desk",
    placeholder: "Mouse",
    aliases: ["mouse"],
  },
  {
    id: "headset",
    label: "Headset",
    short: "Headset",
    group: "audio",
    placeholder: "Headset or headphones",
    aliases: ["headset", "headphones", "headphone", "head phones", "head phone"],
  },
  {
    id: "microphone",
    label: "Microphone",
    short: "Mic",
    group: "audio",
    placeholder: "Microphone",
    aliases: ["microphone", "mic"],
  },
]

export const NAME_ALIASES = ["name", "build", "rig", "build name"] as const

export const DEFAULT_BUILD_NAME = "My rig"

export const STORAGE_KEY = "case-open.build.v1"

export type Build = {
  name: string
  parts: Record<PartId, string>
}

export type SpecSection = {
  id: PartGroup
  title: string
  description: string
}

export const SPEC_SECTIONS: readonly SpecSection[] = [
  {
    id: "audio",
    title: "Headset and microphone",
    description: "They sit on the desk, large enough to spot at a glance.",
  },
  {
    id: "desk",
    title: "The rest of the desk",
    description: "Display, keyboard, and mouse.",
  },
  {
    id: "case",
    title: "Inside the case",
    description: "Visible with the side panel leaning beside the chassis.",
  },
]

const PART_BY_ID = new Map(PARTS.map((part) => [part.id, part]))

export function partById(id: PartId): PartDef {
  const part = PART_BY_ID.get(id)
  if (!part) {
    throw new Error(`Unknown part: ${id}`)
  }
  return part
}

export function emptyParts(): Record<PartId, string> {
  return {
    cpu: "",
    cooler: "",
    motherboard: "",
    gpu: "",
    ram: "",
    storage: "",
    psu: "",
    case: "",
    monitor: "",
    keyboard: "",
    mouse: "",
    headset: "",
    microphone: "",
  }
}

export function emptyBuild(): Build {
  return { name: DEFAULT_BUILD_NAME, parts: emptyParts() }
}

export function isNamed(value: string): boolean {
  return value.trim().length > 0
}

export function countNamed(build: Build): number {
  return PART_IDS.reduce(
    (count, id) => count + (isNamed(build.parts[id]) ? 1 : 0),
    0,
  )
}

export function shortLabel(value: string, max = 22): string {
  const trimmed = value.trim().replace(/\s+/g, " ")
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1).trimEnd()}…`
}

export function slugifyBuildName(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return slug || "my-rig"
}

export function serializeBuild(build: Build): string {
  return `${JSON.stringify(build, null, 2)}\n`
}

export function sanitizeBuild(value: unknown): Build | null {
  if (!value || typeof value !== "object") return null
  const record = value as Record<string, unknown>
  const name =
    typeof record.name === "string" && record.name.trim()
      ? record.name.trim()
      : DEFAULT_BUILD_NAME
  const parts = emptyParts()
  const nested =
    record.parts && typeof record.parts === "object"
      ? (record.parts as Record<string, unknown>)
      : null
  const source = nested ?? record
  let found = false
  for (const id of PART_IDS) {
    const raw = source[id]
    if (typeof raw === "string") {
      parts[id] = raw
      found = true
    }
  }
  if (!found && typeof record.name !== "string") return null
  return { name, parts }
}
