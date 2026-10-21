"use client"

import { useState, useSyncExternalStore } from "react"
import {
  CircuitBoard,
  Cpu,
  Download,
  Fan,
  Gpu,
  HardDrive,
  Headphones,
  Keyboard,
  MemoryStick,
  Mic,
  Monitor,
  Mouse,
  PcCase,
  PlugZap,
  RotateCcw,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { DeskScene } from "@/components/desk-scene"
import {
  DEFAULT_BUILD_NAME,
  PARTS,
  PART_IDS,
  SPEC_SECTIONS,
  countNamed,
  emptyBuild,
  isNamed,
  serializeBuild,
  slugifyBuildName,
  type Build,
  type PartId,
} from "@/lib/build"
import { applyParseResult, parseSpecList } from "@/lib/parse-specs"
import {
  getBuildSnapshot,
  getServerBuild,
  saveBuild,
  subscribeBuild,
} from "@/lib/storage"
import { cn } from "@/lib/utils"

const ICONS = {
  cpu: Cpu,
  cooler: Fan,
  motherboard: CircuitBoard,
  gpu: Gpu,
  ram: MemoryStick,
  storage: HardDrive,
  psu: PlugZap,
  case: PcCase,
  monitor: Monitor,
  keyboard: Keyboard,
  mouse: Mouse,
  headset: Headphones,
  microphone: Mic,
} as const

function downloadBuild(build: Build) {
  const blob = new Blob([serializeBuild(build)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${slugifyBuildName(build.name)}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function focusPartField(id: PartId) {
  requestAnimationFrame(() => {
    document.getElementById(`part-row-${id}`)?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    })
    document.getElementById(`part-${id}`)?.focus()
  })
}

export function Builder() {
  const build = useSyncExternalStore(
    subscribeBuild,
    getBuildSnapshot,
    getServerBuild,
  )
  const [selected, setSelected] = useState<PartId | null>(null)
  const [pasteOpen, setPasteOpen] = useState(false)
  const [clearOpen, setClearOpen] = useState(false)
  const [pasteText, setPasteText] = useState("")
  const [pasteError, setPasteError] = useState<string | null>(null)
  const [unmatched, setUnmatched] = useState<string[]>([])
  const [appliedNote, setAppliedNote] = useState<string | null>(null)

  function setBuild(update: Build | ((current: Build) => Build)) {
    const next = typeof update === "function" ? update(build) : update
    saveBuild(next)
  }

  const named = countNamed(build)
  const dirty =
    named > 0 || build.name.trim() !== DEFAULT_BUILD_NAME

  function selectPart(id: PartId, focusField = false) {
    setSelected(id)
    if (focusField) focusPartField(id)
  }

  function setPart(id: PartId, value: string) {
    setBuild((current) => ({
      ...current,
      parts: { ...current.parts, [id]: value },
    }))
  }

  function applyPaste() {
    const result = parseSpecList(pasteText)
    if (result.error) {
      setPasteError(result.error)
      setUnmatched([])
      setAppliedNote(null)
      return
    }

    const next = applyParseResult(build, result)
    setBuild(next)
    setPasteError(null)
    setUnmatched(result.unmatched)

    const matchedIds = PART_IDS.filter((id) =>
      Object.prototype.hasOwnProperty.call(result.parts, id),
    )
    const matchedCount = matchedIds.length + (result.name ? 1 : 0)
    const note =
      matchedCount === 0
        ? "Nothing matched. Use a label like GPU, Headset, or Mic before the colon."
        : result.unmatched.length > 0
          ? `Updated ${matchedCount}. These lines still need a label we recognize.`
          : null
    setAppliedNote(note)

    const focusId =
      (result.parts.headset !== undefined ? "headset" : null) ??
      (result.parts.microphone !== undefined ? "microphone" : null) ??
      matchedIds[0] ??
      null

    if (focusId) setSelected(focusId)

    if (result.unmatched.length === 0 && matchedCount > 0) {
      setPasteOpen(false)
      setPasteText("")
      setAppliedNote(null)
      if (focusId) focusPartField(focusId)
    }
  }

  function clearBuild() {
    setBuild(emptyBuild())
    setSelected(null)
    setClearOpen(false)
  }

  const caption =
    named === 0
      ? "Every part is still an outline. This page cannot see your computer. Type a name, or paste a list, and that piece fills in."
      : named === PART_IDS.length
        ? "All 13 parts are named. Headset and microphone are on the desk; the rest of the hardware is in the open case or under your hands."
        : `${named} of 13 parts are named. Outlines still need a name. The headset and microphone stay on the desk, where you can see them.`

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="h-1.5 bg-[linear-gradient(90deg,#4a2b1c,#c56a2d_35%,#e2b57e_50%,#c56a2d_65%,#4a2b1c)]" />
      <header className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 pt-6 sm:pt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">
              Desk and open case
            </p>
            <h1 className="font-display text-4xl tracking-tight text-foreground sm:text-5xl">
              Case Open
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              A drawing of your desk with the side panel off. Name each part,
              or paste a spec list, and the labels on the picture update.
              Headset and microphone sit on the desk, not buried in the list.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Dialog
              open={pasteOpen}
              onOpenChange={(open) => {
                setPasteOpen(open)
                if (!open) {
                  setPasteError(null)
                  setUnmatched([])
                  setAppliedNote(null)
                }
              }}
            >
              <DialogTrigger render={<Button />}>Paste specs</DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Paste a spec list</DialogTitle>
                  <DialogDescription>
                    One part per line. A label, a colon, then what you own.
                    Headphones, mic, cooler, mobo, memory, ssd, and power
                    supply all count. Lines we cannot match stay listed.
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  id="paste-specs"
                  value={pasteText}
                  onChange={(event) => {
                    setPasteText(event.target.value)
                    setPasteError(null)
                  }}
                  placeholder={"GPU: graphics card\nHeadset: headset\nMic: microphone\nCPU: processor"}
                  className="min-h-40 font-mono"
                  aria-label="Spec list"
                />
                <p className="text-xs leading-5 text-muted-foreground">
                  Also understood: processor, aio, motherboard, graphics card,
                  ram, nvme, psu, case, monitor, display, keyboard, mouse,
                  microphone. Start a line with Build: to rename the rig. A
                  JSON export can be pasted back in.
                </p>
                {pasteError ? (
                  <p className="text-sm text-destructive" role="alert">
                    {pasteError}
                  </p>
                ) : null}
                {appliedNote ? (
                  <p className="text-sm text-foreground" role="status">
                    {appliedNote}
                  </p>
                ) : null}
                {unmatched.length > 0 ? (
                  <div role="status" aria-live="polite">
                    <p className="mb-2 text-sm font-medium">Unmatched lines</p>
                    <ul className="flex flex-col gap-1">
                      {unmatched.map((line, index) => (
                        <li
                          key={`${line}-${index}`}
                          className="rounded-md bg-muted px-2 py-1 font-mono text-xs"
                        >
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <DialogFooter>
                  <Button type="button" onClick={applyPaste}>
                    Apply to the drawing
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              type="button"
              variant="outline"
              onClick={() => downloadBuild(build)}
            >
              <Download />
              Export JSON
            </Button>
            <Dialog open={clearOpen} onOpenChange={setClearOpen}>
              <DialogTrigger
                render={<Button variant="outline" disabled={!dirty} />}
              >
                <RotateCcw />
                Clear
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Clear this build?</DialogTitle>
                  <DialogDescription>
                    The name returns to My rig and every part becomes an
                    outline again. This only clears what this browser saved.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button type="button" variant="destructive" onClick={clearBuild}>
                    Clear build
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Label htmlFor="build-name">Build name</Label>
            <Input
              id="build-name"
              value={build.name}
              onValueChange={(value) =>
                setBuild((current) => ({ ...current, name: value }))
              }
              onInput={(event) =>
                setBuild((current) => ({
                  ...current,
                  name: event.currentTarget.value,
                }))
              }
              onBlur={() => {
                if (!build.name.trim()) {
                  setBuild((current) => ({
                    ...current,
                    name: DEFAULT_BUILD_NAME,
                  }))
                }
              }}
              className="font-display h-10 text-lg"
              aria-label="Build name"
            />
          </div>
          <Badge variant="secondary" className="h-7 px-3" aria-live="polite">
            {named} of 13 named
          </Badge>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          This browser cannot read the PC you are using. Parts stay blank
          until you type them or paste a list. Saved in this browser.
        </p>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6">
        <section className="min-w-0">
          <Card className="gap-0 overflow-hidden py-0">
            <p className="px-4 pt-3 text-xs text-muted-foreground md:hidden">
              Swipe sideways to see the headset, microphone, and open case.
            </p>
            <div className="overflow-x-auto">
              <DeskScene
                parts={build.parts}
                selected={selected}
                onSelect={(id) => selectPart(id, true)}
                className="min-w-[760px] md:min-w-0"
              />
            </div>
            <p className="px-4 py-3 text-sm leading-6 text-muted-foreground">
              {caption}
            </p>
          </Card>
        </section>

        <aside>
          <Card className="gap-0 py-0">
            <CardHeader className="pt-4">
              <CardTitle>Parts</CardTitle>
              <CardDescription>
                Click a row or a shape. Named parts fill in. Outlines are
                still waiting.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <div className="flex flex-col gap-4">
                  {named === 0 ? (
                    <div className="rounded-xl bg-muted/70 px-3 py-3">
                      <p className="text-sm leading-6 text-foreground">
                        Nothing here is read from a machine. The drawing is a
                        blank rig until you name what you own.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-3"
                        onClick={() => setPasteOpen(true)}
                      >
                        Paste a spec list
                      </Button>
                    </div>
                  ) : null}
                  {SPEC_SECTIONS.map((section) => (
                    <section key={section.id} className="flex flex-col gap-2">
                      <div>
                        <h2 className="text-sm font-medium">{section.title}</h2>
                        <p className="text-xs leading-5 text-muted-foreground">
                          {section.description}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "grid gap-2",
                          section.id === "audio" && "sm:grid-cols-2",
                          section.id === "desk" && "sm:grid-cols-3",
                          section.id === "case" && "sm:grid-cols-2 lg:grid-cols-4",
                        )}
                      >
                        {PARTS.filter((part) => part.group === section.id).map(
                          (part) => {
                            const Icon = ICONS[part.id]
                            const active = selected === part.id
                            const filled = isNamed(build.parts[part.id])
                            return (
                              <div
                                key={part.id}
                                id={`part-row-${part.id}`}
                                data-testid={`row-${part.id}`}
                                className={cn(
                                  "rounded-xl border px-3 py-2.5 transition-colors",
                                  part.group === "audio" &&
                                    "bg-[oklch(0.97_0.02_75)]",
                                  active
                                    ? "border-[oklch(0.55_0.1_50)] bg-[oklch(0.95_0.03_78)]"
                                    : "border-border/80 hover:bg-muted/60",
                                )}
                                onClick={() => selectPart(part.id, true)}
                              >
                                <div className="mb-1.5 flex items-center justify-between gap-2">
                                  <Label
                                    htmlFor={`part-${part.id}`}
                                    className="gap-2"
                                  >
                                    <Icon
                                      className={cn(
                                        part.group === "audio"
                                          ? "size-4 text-[oklch(0.48_0.1_50)]"
                                          : "size-3.5 text-muted-foreground",
                                      )}
                                    />
                                    {part.label}
                                  </Label>
                                  <Badge
                                    variant={filled ? "secondary" : "outline"}
                                  >
                                    {filled ? "Named" : "Add"}
                                  </Badge>
                                </div>
                                <Input
                                  id={`part-${part.id}`}
                                  value={build.parts[part.id]}
                                  placeholder={part.placeholder}
                                  onValueChange={(value) => setPart(part.id, value)}
                                  onInput={(event) =>
                                    setPart(part.id, event.currentTarget.value)
                                  }
                                  onFocus={() => setSelected(part.id)}
                                  aria-label={part.label}
                                />
                              </div>
                            )
                          },
                        )}
                      </div>
                      {section.id !== "case" ? <Separator /> : null}
                    </section>
                  ))}
                </div>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  )
}
