/** @Owl.Providers.Anthropic.ToolResult - Bounded tool result context */
import { TOOL_CONSTANTS } from "../../core/constants/index.js"

/** @Owl.Providers.Anthropic.ToolResultBudget - Truncates oversized results */
export function applyAnthropicToolResultBudget(result: string): string {
  if (result.length <= TOOL_CONSTANTS.TOOL_RESULT_MAX_CHARS) {
    return result
  }

  const omitted = result.length - TOOL_CONSTANTS.TOOL_RESULT_MAX_CHARS
  const marker =
    TOOL_CONSTANTS.TOOL_RESULT_TRUNCATION_PREFIX +
    String(omitted) +
    TOOL_CONSTANTS.TOOL_RESULT_TRUNCATION_SUFFIX
  const kept = Math.max(0, TOOL_CONSTANTS.TOOL_RESULT_MAX_CHARS - marker.length)
  return result.slice(0, kept) + marker
}
