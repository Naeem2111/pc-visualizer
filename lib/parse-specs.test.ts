import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { emptyBuild } from "./build"
import { applyParseResult, parseSpecList, resolveAlias } from "./parse-specs"

describe("resolveAlias", () => {
  it("maps the requested labels and sensible aliases", () => {
    assert.equal(resolveAlias("CPU"), "cpu")
    assert.equal(resolveAlias("processor"), "cpu")
    assert.equal(resolveAlias("Cooler"), "cooler")
    assert.equal(resolveAlias("AIO"), "cooler")
    assert.equal(resolveAlias("cpu cooler"), "cooler")
    assert.equal(resolveAlias("Motherboard"), "motherboard")
    assert.equal(resolveAlias("mobo"), "motherboard")
    assert.equal(resolveAlias("GPU"), "gpu")
    assert.equal(resolveAlias("graphics card"), "gpu")
    assert.equal(resolveAlias("RAM"), "ram")
    assert.equal(resolveAlias("memory"), "ram")
    assert.equal(resolveAlias("storage"), "storage")
    assert.equal(resolveAlias("SSD"), "storage")
    assert.equal(resolveAlias("NVMe"), "storage")
    assert.equal(resolveAlias("M.2"), "storage")
    assert.equal(resolveAlias("PSU"), "psu")
    assert.equal(resolveAlias("power supply"), "psu")
    assert.equal(resolveAlias("case"), "case")
    assert.equal(resolveAlias("Monitor"), "monitor")
    assert.equal(resolveAlias("display"), "monitor")
    assert.equal(resolveAlias("keyboard"), "keyboard")
    assert.equal(resolveAlias("mouse"), "mouse")
    assert.equal(resolveAlias("Headset"), "headset")
    assert.equal(resolveAlias("headphones"), "headset")
    assert.equal(resolveAlias("Microphone"), "microphone")
    assert.equal(resolveAlias("Mic"), "microphone")
    assert.equal(resolveAlias("Build"), "name")
  })

  it("accepts a generic suffix and rejects a different word", () => {
    assert.equal(resolveAlias("GPU model"), "gpu")
    assert.equal(resolveAlias("case fans"), null)
  })
})

describe("parseSpecList", () => {
  it("parses colon lines for the gpu, headset, and mic", () => {
    const result = parseSpecList(
      ["GPU: RTX 4070", "Headset: desk cans", "Mic: boom mic"].join("\n"),
    )
    assert.equal(result.error, undefined)
    assert.deepEqual(result.parts, {
      gpu: "RTX 4070",
      headset: "desk cans",
      microphone: "boom mic",
    })
    assert.deepEqual(result.unmatched, [])
  })

  it("accepts aliases, bullets, numbers, dashes, and a build name", () => {
    const result = parseSpecList(`
      Build: Studio desk
      - processor: sample cpu
      2. AIO - sample cooler
      mobo: sample board
      memory: sample kit
      nvme: sample ssd
      power supply: sample psu
      display: sample panel
      headphones: sample cans
      # ignored note

      just a loose sentence
    `)

    assert.equal(result.name, "Studio desk")
    assert.equal(result.parts.cpu, "sample cpu")
    assert.equal(result.parts.cooler, "sample cooler")
    assert.equal(result.parts.motherboard, "sample board")
    assert.equal(result.parts.ram, "sample kit")
    assert.equal(result.parts.storage, "sample ssd")
    assert.equal(result.parts.psu, "sample psu")
    assert.equal(result.parts.monitor, "sample panel")
    assert.equal(result.parts.headset, "sample cans")
    assert.deepEqual(result.unmatched, ["just a loose sentence"])
  })

  it("joins repeated parts and keeps unmatched lines", () => {
    const result = parseSpecList("SSD: first drive\nNVMe: second drive\nFans: three")
    assert.equal(result.parts.storage, "first drive · second drive")
    assert.deepEqual(result.unmatched, ["Fans: three"])
  })

  it("reads an exported JSON build", () => {
    const result = parseSpecList(
      JSON.stringify({
        name: "Night desk",
        parts: { headset: "cans", microphone: "mic", cpu: "" },
        extra: true,
      }),
    )
    assert.equal(result.name, "Night desk")
    assert.equal(result.parts.headset, "cans")
    assert.equal(result.parts.microphone, "mic")
    assert.equal(result.parts.cpu, "")
    assert.deepEqual(result.unmatched, ["Unknown field: extra"])
  })

  it("reports invalid JSON", () => {
    const result = parseSpecList("{not json")
    assert.match(result.error ?? "", /not valid JSON/)
  })

  it("asks for text when the paste is empty", () => {
    const result = parseSpecList("   ")
    assert.match(result.error ?? "", /Paste a few lines/)
  })

  it("merges onto an existing build without dropping other parts", () => {
    const current = emptyBuild()
    current.parts.cpu = "kept"
    const next = applyParseResult(
      current,
      parseSpecList("Headset: added\nMic: added mic"),
    )
    assert.equal(next.parts.cpu, "kept")
    assert.equal(next.parts.headset, "added")
    assert.equal(next.parts.microphone, "added mic")
    assert.equal(next.name, "My rig")
  })
})
