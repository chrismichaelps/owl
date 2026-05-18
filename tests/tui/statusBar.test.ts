/** @Owl.Tests.TUI.StatusBar - Status bar routing budget display */
import { describe, expect, it } from "vitest"
import {
  formatModeCostBudget,
  formatTokenPressureWarning,
} from "../../src/tui/components/StatusBar.js"

describe("formatModeCostBudget", () => {
  it("renders configured mode cost budgets", () => {
    expect(formatModeCostBudget("economy")).toBe("$0.0050")
    expect(formatModeCostBudget("quick")).toBe("$0.0200")
  })

  it("renders open for unconstrained modes", () => {
    expect(formatModeCostBudget("deep")).toBe("open")
    expect(formatModeCostBudget("god")).toBe("open")
  })
})

describe("formatTokenPressureWarning", () => {
  it("returns null below the warning threshold", () => {
    expect(formatTokenPressureWarning("quick", 2_000, 1_000)).toBeNull()
  })

  it("renders compact guidance when context is low", () => {
    expect(formatTokenPressureWarning("quick", 5_500, 500)).toBe(
      "context:25% left · /compact",
    )
  })
})
