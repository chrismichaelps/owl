/** @Owl.Tests.TUI.Focus - Workbench focus navigation */
import { describe, expect, it } from "vitest"
import { TUI_FOCUS } from "../../src/core/constants/index.js"
import { moveFocusPanel } from "../../src/tui/focus/index.js"

describe("moveFocusPanel", () => {
  it("moves response focus right to metrics", () => {
    expect(moveFocusPanel(TUI_FOCUS.RESPONSE, 1)).toBe(TUI_FOCUS.METRICS)
  })

  it("moves response focus left to logs", () => {
    expect(moveFocusPanel(TUI_FOCUS.RESPONSE, -1)).toBe(TUI_FOCUS.LOGS)
  })

  it("wraps right from metrics to logs", () => {
    expect(moveFocusPanel(TUI_FOCUS.METRICS, 1)).toBe(TUI_FOCUS.LOGS)
  })

  it("wraps left from logs to metrics", () => {
    expect(moveFocusPanel(TUI_FOCUS.LOGS, -1)).toBe(TUI_FOCUS.METRICS)
  })
})
