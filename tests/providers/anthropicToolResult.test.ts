/** @Owl.Tests.Providers.Anthropic.ToolResult - Tool result budget tests */
import { describe, expect, it } from "vitest"
import { TOOL_CONSTANTS } from "../../src/core/constants/index.js"
import { applyAnthropicToolResultBudget } from "../../src/providers/anthropic/toolResult.js"

describe("applyAnthropicToolResultBudget", () => {
  it("keeps tool results under the configured provider budget", () => {
    const oversized = "x".repeat(TOOL_CONSTANTS.TOOL_RESULT_MAX_CHARS + 100)
    const bounded = applyAnthropicToolResultBudget(oversized)

    expect(bounded.length).toBeLessThanOrEqual(
      TOOL_CONSTANTS.TOOL_RESULT_MAX_CHARS,
    )
    expect(bounded).toContain(TOOL_CONSTANTS.TOOL_RESULT_TRUNCATION_PREFIX)
    expect(bounded).toContain(TOOL_CONSTANTS.TOOL_RESULT_TRUNCATION_SUFFIX)
  })

  it("leaves already bounded tool results unchanged", () => {
    const bounded = "small result"

    expect(applyAnthropicToolResultBudget(bounded)).toBe(bounded)
  })
})
