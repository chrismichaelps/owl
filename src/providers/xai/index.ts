/**
 * @Owl.Providers.xAI - xAI Grok adapter (OpenAI-compatible API)
 *
 * xAI's Grok models are OpenAI-compatible with their own capabilities.
 *
 * Authentication: Requires XAI_API_KEY environment variable.
 *
 * Models:
 * - grok-3: High reasoning depth, OpenAI-compatible API
 *
 * @example
 * yield* registerProvider(router, XAIAdapterLive)
 */
import OpenAI from "openai"
import { Context, Effect, Layer } from "effect"
import * as Stream from "effect/Stream"
import { ProviderError } from "../../core/errors/index.js"
import { OWL_CONFIG } from "../../core/config/index.js"
import type { LLMProviderService, ProviderCapability } from "../types.js"
import type {
  InferenceRequest,
  InferenceResponse,
} from "../../core/schema/index.js"

/**
 * @Owl.Providers.xAI.Capabilities - Grok model specifications
 */
const XAI_CAPABILITIES: readonly ProviderCapability[] = [
  {
    providerId: "xai",
    modelId: "grok-3",
    contextWindow: 131_072,
    maxOutputTokens: 8_192,
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.015,
    supportsStreaming: true,
    reasoningDepth: "high",
    supportsFunctionCalling: true,
    supportsVision: true,
  },
]

/** @Owl.Providers.xAI.Adapter - service definition */
export class XAIAdapter extends Context.Tag("XAIAdapter")<
  XAIAdapter,
  LLMProviderService
>() {}

/**
 * @Owl.Providers.xAI.Implementation - Production layer logic
 *
 * Uses OpenAI SDK with xAI base URL for OpenAI-compatible API.
 */
export const XAIAdapterLive = Layer.effect(
  XAIAdapter,
  Effect.gen(function* () {
    const config = yield* OWL_CONFIG

    /** @Owl.Providers.xAI.Client - OpenAI-compatible xAI client */
    const client = new OpenAI({
      apiKey: config.xaiApiKey,
      baseURL: "https://api.x.ai/v1",
    })

    const complete = (
      request: InferenceRequest,
    ): Effect.Effect<InferenceResponse, ProviderError> =>
      Effect.tryPromise({
        try: async () => {
          const startMs = Date.now()
          const response = await client.chat.completions.create({
            model: request.model,
            max_tokens: request.maxTokens,
            messages: request.messages.map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
          })
          return {
            taskId: request.taskId,
            content: response.choices[0]?.message.content ?? "",
            stopReason: "end_turn" as const,
            usage: {
              inputTokens: response.usage?.prompt_tokens ?? 0,
              outputTokens: response.usage?.completion_tokens ?? 0,
              cacheReadTokens: 0,
              cacheWriteTokens: 0,
            },
            model: response.model,
            provider: "xai" as const,
            latencyMs: Date.now() - startMs,
          } satisfies InferenceResponse
        },
        catch: (e) =>
          new ProviderError({ provider: "xai", message: String(e) }),
      })

    return {
      id: "xai",
      capabilities: XAI_CAPABILITIES,
      complete,
      stream: () => Stream.empty,
      countTokens: (_text, _model) =>
        Effect.succeed(Math.ceil(_text.length / 4)),
      healthCheck: () => Effect.succeed(true),
    } satisfies LLMProviderService
  }),
)
