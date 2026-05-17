/** @Owl.Tests.Core.Constants - Core constants and budget tests */
import { describe, it, expect } from "vitest"
import { HashSet } from "effect"
import {
  TOKEN_LIMITS,
  PROVIDER_TIMEOUTS,
  PROVIDER_CONSTANTS,
  RETRY_CONFIG,
  DEPTH_THRESHOLDS,
  ADAPTIVE_ESCALATION,
  ADAPTIVE_ESCALATION_KEYWORDS,
  MARKDOWN_CONSTANTS,
  TOOL_CONSTANTS,
  TUI_OUTPUT_PANEL,
  TUI_ROUTING_COPY,
  TUI_RUNTIME_COPY,
  resolveModeThinkingBudget,
  resolveModeCostBudget,
  resolveModeTokenBudget,
} from "../../src/core/constants/index.js"

/** @Owl.Tests.Core.Constants.Contract - System-wide threshold verification */
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

  it("PROVIDER_CONSTANTS centralize provider runtime bounds", () => {
    expect(PROVIDER_CONSTANTS.TOKEN_ESTIMATION_CHARS_PER_TOKEN).toBe(4)
    expect(PROVIDER_CONSTANTS.ANTHROPIC_MAX_TOOL_ITERATIONS).toBe(10)
    expect(PROVIDER_CONSTANTS.ANTHROPIC_TOOL_ITERATION_LIMIT_MESSAGE).toContain(
      "limit",
    )
  })

  it("TOOL_CONSTANTS centralize command buffer bounds", () => {
    expect(TOOL_CONSTANTS.BASH_COMMAND_FLAG).toBe("-c")
    expect(TOOL_CONSTANTS.BASH_MAX_BUFFER_MULTIPLIER).toBe(4)
    expect(TOOL_CONSTANTS.GREP_MAX_BUFFER_MULTIPLIER).toBe(4)
  })

  it("MARKDOWN_CONSTANTS centralize parser structure", () => {
    expect(MARKDOWN_CONSTANTS.CODE_FENCE_LENGTH).toBe(3)
  })

  it("TUI_OUTPUT_PANEL centralizes viewport estimates", () => {
    expect(TUI_OUTPUT_PANEL.RESERVED_ROWS).toBeGreaterThan(0)
    expect(TUI_OUTPUT_PANEL.ROWS_PER_TURN).toBeGreaterThan(0)
  })

  it("TUI runtime copy avoids false registry sync claims", () => {
    expect(TUI_RUNTIME_COPY.RESPONSE_RECORDED).toBe("✓ Response recorded")
  })

  it("TUI routing copy centralizes adaptive route display", () => {
    expect(TUI_ROUTING_COPY.LABEL).toBe("Route")
    expect(TUI_ROUTING_COPY.MODE_SEPARATOR).toBe(" → ")
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
    const economy = resolveModeTokenBudget("economy")
    const standard = resolveModeTokenBudget("standard")
    const god = resolveModeTokenBudget("god")
    expect(economy).toBeLessThan(standard)
    expect(god).toBeGreaterThan(standard)
  })

  it("mode budget resolvers return safe defaults and optional thinking", () => {
    expect(resolveModeTokenBudget("unknown")).toBe(
      TOKEN_LIMITS.DEFAULT_SESSION_BUDGET,
    )
    expect(resolveModeThinkingBudget("deep")).toBe(10000)
    expect(resolveModeThinkingBudget("quick")).toBeUndefined()
  })

  it("mode cost budgets constrain cheaper modes only", () => {
    expect(resolveModeCostBudget("economy")).toBeLessThan(
      resolveModeCostBudget("standard") ?? Number.POSITIVE_INFINITY,
    )
    expect(resolveModeCostBudget("deep")).toBeUndefined()
    expect(resolveModeCostBudget("god")).toBeUndefined()
  })

  it("adaptive escalation constants centralize routing heuristics", () => {
    expect(
      ADAPTIVE_ESCALATION.STANDARD_TO_DEEP_TOKEN_THRESHOLD,
    ).toBeGreaterThan(0)
    expect(HashSet.has(ADAPTIVE_ESCALATION_KEYWORDS, "architecture")).toBe(true)
  })
})
