import { STORAGE_KEY, emptyBuild, sanitizeBuild, type Build } from "./build"

const serverBuild = emptyBuild()

type Memory = {
  raw: string | null
  build: Build
}

let memory: Memory = { raw: null, build: serverBuild }
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function readRaw(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function buildFromRaw(raw: string | null): Build {
  if (!raw) return serverBuild
  try {
    return sanitizeBuild(JSON.parse(raw)) ?? serverBuild
  } catch {
    return serverBuild
  }
}

export function getServerBuild(): Build {
  return serverBuild
}

export function getBuildSnapshot(): Build {
  const raw = readRaw()
  if (memory.raw === raw) return memory.build
  memory = { raw, build: buildFromRaw(raw) }
  return memory.build
}

export function subscribeBuild(listener: () => void) {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return
    memory = { raw: "__stale__", build: memory.build }
    listener()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

export function saveBuild(build: Build) {
  if (typeof window === "undefined") return
  try {
    const raw = JSON.stringify(build)
    window.localStorage.setItem(STORAGE_KEY, raw)
    memory = { raw, build }
  } catch {
    memory = { raw: memory.raw, build }
  }
  emit()
}

export function loadBuild(): Build | null {
  const build = getBuildSnapshot()
  if (build === serverBuild && readRaw() === null) return null
  return build
}
