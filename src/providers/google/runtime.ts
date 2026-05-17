/** @Owl.Providers.Google.Runtime - Gemini prompt and usage helpers */
import { Chunk, Data } from "effect"
import {
  GOOGLE_MODELS,
  PROVIDER_CONSTANTS,
} from "../../core/constants/index.js"
import { estimateModelCostUsd } from "../cost.js"
import { decodeGoogleUsageMetadata } from "./schema.js"
import type { InferenceRequest } from "../../core/schema/index.js"
import type { ProviderCapability } from "../types.js"

/** @Owl.Providers.Google.Capabilities - Multimodal model specifications */
export const GOOGLE_CAPABILITIES: readonly ProviderCapability[] = [
  Data.struct({
    providerId: "google",
    modelId: GOOGLE_MODELS.GEMINI_2_5_FLASH,
    contextWindow: 1_048_576,
    maxOutputTokens: 65_536,
    inputCostPer1k: 0.00015,
    outputCostPer1k: 0.0006,
    supportsStreaming: true,
    reasoningDepth: "medium",
    supportsFunctionCalling: true,
    supportsVision: true,
  }),
  Data.struct({
    providerId: "google",
    modelId: GOOGLE_MODELS.GEMINI_2_5_PRO,
    contextWindow: 1_048_576,
    maxOutputTokens: 65_536,
    inputCostPer1k: 0.00125,
    outputCostPer1k: 0.01,
    supportsStreaming: true,
    reasoningDepth: "high",
    supportsFunctionCalling: true,
    supportsVision: true,
  }),
]

export interface GoogleResponseLike {
  readonly text: () => string
  readonly usageMetadata?: unknown
}

export const estimateTextTokens = (text: string): number =>
  Math.ceil(text.length / PROVIDER_CONSTANTS.TOKEN_ESTIMATION_CHARS_PER_TOKEN)

export const buildPrompt = (request: InferenceRequest): string =>
  Chunk.toReadonlyArray(
    Chunk.map(
      Chunk.filter(
        Chunk.fromIterable(request.messages),
        (message) => message.role !== "system",
      ),
      (message) => message.content,
    ),
  ).join("\n")

export const makeModelParams = (request: InferenceRequest) => ({
  model: request.model,
  generationConfig: {
    maxOutputTokens: request.maxTokens,
  },
  ...(request.systemPrompt !== undefined
    ? { systemInstruction: request.systemPrompt }
    : {}),
})

export const usageFromResponse = (
  request: InferenceRequest,
  prompt: string,
  content: string,
  response: GoogleResponseLike,
) => {
  const metadata = decodeGoogleUsageMetadata(response.usageMetadata)
  const inputTokens = metadata?.promptTokenCount ?? estimateTextTokens(prompt)
  const outputTokens =
    metadata?.candidatesTokenCount ?? estimateTextTokens(content)

  return Data.struct({
    inputTokens,
    outputTokens,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    estimatedCostUsd: estimateModelCostUsd(
      GOOGLE_CAPABILITIES,
      request.model,
      inputTokens,
      outputTokens,
    ),
  })
}
