/** @Owl.Providers.OpenAI.Runtime - OpenAI message and capability helpers */
import { Chunk, Data } from "effect"
import {
  OPENAI_MODELS,
  PROVIDER_CONSTANTS,
} from "../../core/constants/index.js"
import type { InferenceRequest } from "../../core/schema/index.js"
import type { ProviderCapability } from "../types.js"

/** @Owl.Providers.OpenAI.Capabilities - Model specifications and pricing */
export const OPENAI_CAPABILITIES: readonly ProviderCapability[] = [
  Data.struct({
    providerId: "openai",
    modelId: OPENAI_MODELS.GPT_4O,
    contextWindow: 128_000,
    maxOutputTokens: 16_384,
    inputCostPer1k: 0.0025,
    outputCostPer1k: 0.01,
    supportsStreaming: true,
    reasoningDepth: "high",
    supportsFunctionCalling: true,
    supportsVision: true,
  }),
  Data.struct({
    providerId: "openai",
    modelId: OPENAI_MODELS.GPT_4_1,
    contextWindow: 1_047_576,
    maxOutputTokens: 32_768,
    inputCostPer1k: 0.002,
    outputCostPer1k: 0.008,
    supportsStreaming: true,
    reasoningDepth: "high",
    supportsFunctionCalling: true,
    supportsVision: true,
  }),
  Data.struct({
    providerId: "openai",
    modelId: OPENAI_MODELS.O3,
    contextWindow: 200_000,
    maxOutputTokens: 100_000,
    inputCostPer1k: 0.002,
    outputCostPer1k: 0.008,
    supportsStreaming: true,
    reasoningDepth: "high",
    supportsFunctionCalling: true,
    supportsVision: true,
  }),
  Data.struct({
    providerId: "openai",
    modelId: OPENAI_MODELS.O4_MINI,
    contextWindow: 200_000,
    maxOutputTokens: 100_000,
    inputCostPer1k: 0.0011,
    outputCostPer1k: 0.0044,
    supportsStreaming: true,
    reasoningDepth: "high",
    supportsFunctionCalling: true,
    supportsVision: true,
  }),
  Data.struct({
    providerId: "openai",
    modelId: OPENAI_MODELS.GPT_5,
    contextWindow: 1_000_000,
    maxOutputTokens: 32_768,
    inputCostPer1k: 0.005,
    outputCostPer1k: 0.025,
    supportsStreaming: true,
    reasoningDepth: "high",
    supportsFunctionCalling: true,
    supportsVision: true,
  }),
]

export const estimateTextTokens = (text: string): number =>
  Math.ceil(text.length / PROVIDER_CONSTANTS.TOKEN_ESTIMATION_CHARS_PER_TOKEN)

export const buildMessages = (request: InferenceRequest) => {
  const messages = Chunk.map(Chunk.fromIterable(request.messages), (message) =>
    Data.struct({
      role: message.role as "user" | "assistant",
      content: message.content,
    }),
  )

  return Chunk.toArray(
    request.systemPrompt !== undefined
      ? Chunk.prepend(
          messages,
          Data.struct({
            role: "system" as const,
            content: request.systemPrompt,
          }),
        )
      : messages,
  )
}
