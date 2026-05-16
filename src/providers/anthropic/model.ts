/** @Owl.Providers.Anthropic.Model - Claude model capabilities and request helpers */
import { Data } from "effect"
import { ANTHROPIC_MODELS } from "../../core/constants/index.js"
import type { InferenceRequest } from "../../core/schema/index.js"
import type { ProviderCapability } from "../types.js"
import type Anthropic from "@anthropic-ai/sdk"

export const ANTHROPIC_INTERNAL_CONSTANTS = {
  BLOCK_TYPE_TEXT: "text",
  BLOCK_TYPE_TOOL_USE: "tool_use",
  STOP_REASON_TOOL_USE: "tool_use",
  STOP_REASON_END_TURN: "end_turn",
  EVENT_TYPE_CONTENT_BLOCK_DELTA: "content_block_delta",
  DELTA_TYPE_TEXT_DELTA: "text_delta",
  DELTA_TYPE_THINKING_DELTA: "thinking_delta",
} as const

type AnthropicThinking =
  | { readonly type: "adaptive" }
  | { readonly type: "enabled"; readonly budget_tokens: number }

export type AnthropicNonStreamingParamsWithThinking =
  Anthropic.MessageCreateParamsNonStreaming & {
    thinking?: AnthropicThinking
  }

export type AnthropicStreamParamsWithThinking =
  Anthropic.MessageStreamParams & {
    thinking?: AnthropicThinking
  }

/** @Owl.Providers.Anthropic.Thinking - Resolve Claude thinking contract */
export const resolveThinking = (
  request: InferenceRequest,
): AnthropicThinking | undefined => {
  if (request.thinkingBudget === undefined) return undefined
  if (request.model === ANTHROPIC_MODELS.OPUS_4_7) {
    return Data.struct({ type: "adaptive" as const })
  }
  return Data.struct({
    type: "enabled" as const,
    budget_tokens: request.thinkingBudget,
  })
}

/** @Owl.Providers.Anthropic.Capabilities - High-fidelity model specifications */
export const ANTHROPIC_CAPABILITIES: readonly ProviderCapability[] = [
  {
    providerId: "anthropic",
    modelId: ANTHROPIC_MODELS.OPUS_4_7,
    contextWindow: 1_000_000,
    maxOutputTokens: 128_000,
    inputCostPer1k: 0.005,
    outputCostPer1k: 0.025,
    supportsStreaming: true,
    reasoningDepth: "high",
    supportsFunctionCalling: true,
    supportsVision: true,
  },
  {
    providerId: "anthropic",
    modelId: ANTHROPIC_MODELS.SONNET_4_6,
    contextWindow: 200_000,
    maxOutputTokens: 8_192,
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.015,
    supportsStreaming: true,
    reasoningDepth: "high",
    supportsFunctionCalling: true,
    supportsVision: true,
  },
  {
    providerId: "anthropic",
    modelId: ANTHROPIC_MODELS.HAIKU_4_5,
    contextWindow: 200_000,
    maxOutputTokens: 64_000,
    inputCostPer1k: 0.001,
    outputCostPer1k: 0.005,
    supportsStreaming: true,
    reasoningDepth: "low",
    supportsFunctionCalling: true,
    supportsVision: true,
  },
]
