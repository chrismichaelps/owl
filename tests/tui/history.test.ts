/** @Owl.Tests.TUI.History - Prompt history normalization tests */
import { describe, expect, it } from "vitest"
import { TUI_HISTORY_CONSTANTS } from "../../src/core/constants/index.js"
import {
  makeHistoryEntry,
  normalizeHistoryEntries,
} from "../../src/tui/history/index.js"

describe("makeHistoryEntry", () => {
  it("trims prompts and stores project scope", () => {
    const entry = makeHistoryEntry("  /models  ", "/project", 123)

    expect(entry).toEqual({
      prompt: "/models",
      project: "/project",
      ts: 123,
    })
  })
})

describe("normalizeHistoryEntries", () => {
  it("returns newest-first prompts for the active project", () => {
    const result = normalizeHistoryEntries(
      [
        makeHistoryEntry("older", "/project", 1),
        makeHistoryEntry("other", "/elsewhere", 2),
        makeHistoryEntry("newer", "/project", 3),
      ],
      "/project",
    )

    expect(result).toEqual(["newer", "older"])
  })

  it("deduplicates consecutive prompts after newest-first ordering", () => {
    const result = normalizeHistoryEntries(
      [
        makeHistoryEntry("build", "/project", 1),
        makeHistoryEntry("test", "/project", 2),
        makeHistoryEntry("test", "/project", 3),
        makeHistoryEntry("build", "/project", 4),
      ],
      "/project",
    )

    expect(result).toEqual(["build", "test", "build"])
  })

  it("bounds retained prompts to the configured limit", () => {
    const entries = Array.from(
      { length: TUI_HISTORY_CONSTANTS.MAX_ENTRIES + 1 },
      (_, index) =>
        makeHistoryEntry("prompt-" + String(index), "/project", index),
    )

    const result = normalizeHistoryEntries(entries, "/project")

    expect(result).toHaveLength(TUI_HISTORY_CONSTANTS.MAX_ENTRIES)
    expect(result[0]).toBe(
      "prompt-" + String(TUI_HISTORY_CONSTANTS.MAX_ENTRIES),
    )
  })
})
