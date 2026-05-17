/** @Owl.Tests.TUI.StatusBar - Status bar routing budget display */
import { describe, expect, it } from "vitest"
import { formatModeCostBudget } from "../../src/tui/components/StatusBar.js"

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
