/** @Owl.Providers.xAI.Runtime - xAI message and capability helpers */
import { Chunk, Data } from "effect"
import { PROVIDER_CONSTANTS, XAI_MODELS } from "../../core/constants/index.js"
import type { InferenceRequest } from "../../core/schema/index.js"
import type { ProviderCapability } from "../types.js"

/** @Owl.Providers.xAI.Capabilities - Grok model specifications */
export const XAI_CAPABILITIES: readonly ProviderCapability[] = [
  Data.struct({
    providerId: "xai",
    modelId: XAI_MODELS.GROK_3,
    contextWindow: 131_072,
    maxOutputTokens: 8_192,
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.015,
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
