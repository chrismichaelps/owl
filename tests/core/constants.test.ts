import { describe, it, expect } from "vitest"
import {
  TOKEN_LIMITS,
  PROVIDER_TIMEOUTS,
  RETRY_CONFIG,
  DEPTH_THRESHOLDS,
  MODE_TOKEN_BUDGETS,
} from "../../src/core/constants/index.js"

describe("system constants", () => {
  it("TOKEN_LIMITS covers all modes", () => {
    expect(TOKEN_LIMITS.CONTEXT_WINDOW_DEFAULT).toBe(200000)
    expect(TOKEN_LIMITS.MAX_OUTPUT_TOKENS).toBe(8192)
    expect(TOKEN_LIMITS.MARKOV_WINDOW_SIZE).toBe(2)
  })

  it("PROVIDER_TIMEOUTS are reasonable", () => {
    expect(PROVIDER_TIMEOUTS.DEFAULT_MS).toBe(30000)
    expect(PROVIDER_TIMEOUTS.STREAM_CHUNK_TIMEOUT_MS).toBe(5000)
  })

  it("RETRY_CONFIG has exponential backoff settings", () => {
    expect(RETRY_CONFIG.MAX_ATTEMPTS).toBe(3)
    expect(RETRY_CONFIG.BASE_DELAY_MS).toBe(1000)
    expect(RETRY_CONFIG.MAX_DELAY_MS).toBe(30000)
  })

  it("DEPTH_THRESHOLDS match FMCF spec", () => {
    expect(DEPTH_THRESHOLDS.DEEP).toBe(0.7)
    expect(DEPTH_THRESHOLDS.SHALLOW).toBe(0.4)
  })

  it("MODE_TOKEN_BUDGETS define per-task limits", () => {
    const { economy = 0, standard = 0, god = 0 } = MODE_TOKEN_BUDGETS
    expect(economy).toBeLessThan(standard)
    expect(god).toBeGreaterThan(standard)
  })
})
