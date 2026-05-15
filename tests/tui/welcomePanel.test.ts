/** @Owl.Tests.TUI.WelcomePanel - Startup workbench helper tests */
import { describe, expect, it } from "vitest"
import { TUI_WELCOME } from "../../src/core/constants/index.js"
import {
  formatProjectPath,
  resolveWelcomeWidth,
} from "../../src/tui/components/WelcomePanel.js"

describe("resolveWelcomeWidth", () => {
  it("keeps a stable minimum width for narrow terminals", () => {
    expect(resolveWelcomeWidth(20)).toBe(TUI_WELCOME.MIN_WIDTH)
  })

  it("uses terminal columns minus the border margin for wide terminals", () => {
    expect(resolveWelcomeWidth(120)).toBe(118)
  })
})

describe("formatProjectPath", () => {
  it("returns absolute paths when outside HOME", () => {
    expect(formatProjectPath("/workspace/owl")).toBe("/workspace/owl")
  })
})
