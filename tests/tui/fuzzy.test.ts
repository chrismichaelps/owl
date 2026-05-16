/** @Owl.Tests.TUI.Fuzzy - Command palette ranking tests */
import { describe, expect, it } from "vitest"
import {
  completePaletteCommand,
  getPaletteSuggestion,
  parsePaletteInput,
  rankPaletteCommands,
} from "../../src/tui/commands/fuzzy.js"
import {
  detectSlashMode,
  resolveModeColor,
} from "../../src/tui/commands/modes.js"

const COMMANDS = [
  { name: "help", description: "List available commands" },
  { name: "memory", description: "Display recent session turn history" },
  { name: "model", description: "Set routing preference" },
  { name: "edit", description: "Apply a surgical replacement" },
] as const

describe("rankPaletteCommands", () => {
  it("returns all commands for an empty query sorted by name", () => {
    expect(rankPaletteCommands(COMMANDS, "").map((c) => c.name)).toEqual([
      "edit",
      "help",
      "memory",
      "model",
    ])
  })

  it("prefers exact command name matches", () => {
    expect(rankPaletteCommands(COMMANDS, "model")[0]?.name).toBe("model")
  })

  it("supports slash-prefixed queries", () => {
    expect(rankPaletteCommands(COMMANDS, "/mem")[0]?.name).toBe("memory")
  })

  it("falls back to description matches", () => {
    expect(rankPaletteCommands(COMMANDS, "routing")[0]?.name).toBe("model")
  })
})

describe("parsePaletteInput", () => {
  it("extracts the command query without the slash", () => {
    expect(parsePaletteInput("/mem")).toEqual({
      commandQuery: "mem",
      args: "",
    })
  })

  it("preserves arguments after the command query", () => {
    expect(parsePaletteInput("/deep refactor src")).toEqual({
      commandQuery: "deep",
      args: "refactor src",
    })
  })
})

describe("completePaletteCommand", () => {
  it("completes a command and keeps arguments", () => {
    expect(completePaletteCommand("/de refactor src", "deep")).toBe(
      "/deep refactor src",
    )
  })

  it("adds a trailing space for command-only completions", () => {
    expect(completePaletteCommand("/mem", "memory")).toBe("/memory ")
  })
})

describe("getPaletteSuggestion", () => {
  it("suggests the selected command when the user types only slash", () => {
    expect(getPaletteSuggestion("/", COMMANDS, 0)).toBe("edit ")
  })

  it("suggests the remaining command suffix for a partial command", () => {
    expect(getPaletteSuggestion("/mo", COMMANDS, 0)).toBe("del ")
  })

  it("does not suggest after command arguments have started", () => {
    expect(getPaletteSuggestion("/model auto", COMMANDS, 0)).toBe("")
  })
})

describe("detectSlashMode", () => {
  it("detects exact mode commands", () => {
    expect(detectSlashMode("/task")).toBe("standard")
    expect(detectSlashMode("/quick")).toBe("quick")
    expect(detectSlashMode("/deep")).toBe("deep")
    expect(detectSlashMode("/economy")).toBe("economy")
    expect(detectSlashMode("/god")).toBe("god")
  })

  it("detects mode commands with prompt arguments", () => {
    expect(detectSlashMode("/deep refactor the editor")).toBe("deep")
  })

  it("does not treat partial command names as mode commands", () => {
    expect(detectSlashMode("/deeply consider this")).toBeNull()
  })
})

describe("resolveModeColor", () => {
  it("resolves prompt colors from the mode lookup", () => {
    expect(resolveModeColor("standard")).toBe("green")
    expect(resolveModeColor("god")).toBe("red")
  })
})
