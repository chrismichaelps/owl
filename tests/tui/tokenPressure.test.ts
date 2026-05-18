/** @Owl.Tests.TUI.TokenPressure - Context pressure warning state */
import { describe, expect, it } from "vitest"
import {
  TOKEN_PRESSURE_LEVEL,
  resolveTokenPressure,
} from "../../src/tui/status/tokenPressure.js"

describe("resolveTokenPressure", () => {
  it("stays ok below the warning threshold", () => {
    const pressure = resolveTokenPressure("quick", 2_000, 1_000)
    expect(pressure.level).toBe(TOKEN_PRESSURE_LEVEL.OK)
    expect(pressure.remainingPercent).toBe(62)
  })

  it("warns when the mode budget is mostly consumed", () => {
    const pressure = resolveTokenPressure("quick", 5_500, 500)
    expect(pressure.level).toBe(TOKEN_PRESSURE_LEVEL.WARNING)
    expect(pressure.usedPercent).toBe(75)
  })

  it("becomes critical near exhaustion", () => {
    const pressure = resolveTokenPressure("quick", 7_000, 500)
    expect(pressure.level).toBe(TOKEN_PRESSURE_LEVEL.CRITICAL)
    expect(pressure.remainingPercent).toBe(6)
  })

  it("clamps over-budget sessions", () => {
    const pressure = resolveTokenPressure("economy", 3_000, 500)
    expect(pressure.level).toBe(TOKEN_PRESSURE_LEVEL.CRITICAL)
    expect(pressure.usedPercent).toBe(100)
    expect(pressure.remainingPercent).toBe(0)
  })
})
