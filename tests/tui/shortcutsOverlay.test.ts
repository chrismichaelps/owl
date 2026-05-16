/** @Owl.Tests.TUI.ShortcutsOverlay - Shortcut guide helper tests */
import { describe, expect, it } from "vitest"
import {
  TUI_SHORTCUTS,
  TUI_SHORTCUTS_LAYOUT,
} from "../../src/core/constants/index.js"
import { formatShortcutKey } from "../../src/tui/components/ShortcutsOverlay.js"

describe("formatShortcutKey", () => {
  it("pads keys to the configured column width", () => {
    expect(formatShortcutKey("?")).toHaveLength(
      TUI_SHORTCUTS_LAYOUT.KEY_COLUMN_WIDTH,
    )
  })

  it("keeps already-wide shortcut labels intact", () => {
    const key = "ctrl+shift+p"
    expect(formatShortcutKey(key)).toBe(key)
  })
})

describe("TUI_SHORTCUTS", () => {
  it("includes the Claude-style shortcuts trigger", () => {
    expect(TUI_SHORTCUTS.some(([key]) => key === "?")).toBe(true)
  })

  it("includes routing and file-context discoverability", () => {
    const keys = TUI_SHORTCUTS.map(([key]) => key)
    expect(keys).toContain("/model")
    expect(keys).toContain("@file")
  })
})
