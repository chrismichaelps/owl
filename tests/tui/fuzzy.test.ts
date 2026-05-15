/** @Owl.Tests.TUI.Fuzzy - Command palette ranking tests */
import { describe, expect, it } from "vitest"
import { rankPaletteCommands } from "../../src/tui/commands/fuzzy.js"

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
