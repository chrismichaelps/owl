/** @Owl.Providers.Anthropic - Anthropic Claude adapter (primary reasoning provider) */

import Anthropic from "@anthropic-ai/sdk"
import { Context, Effect, Layer, Schedule } from "effect"
import * as Stream from "effect/Stream"
import {
  ProviderError,
  ProviderAuthError,
  ProviderRateLimitError,
  ProviderTimeoutError,
  ProviderStreamError,
} from "../../core/errors/index.js"
import { OWL_CONFIG } from "../../core/config/index.js"
import {
  HTTP_STATUS,
  PROVIDER_TIMEOUTS,
  RETRY_CONFIG,
} from "../../core/constants/index.js"
import type {
  LLMProviderService,
  ProviderCapability,
  StreamChunk,
} from "../types.js"
import type {
  InferenceRequest,
  InferenceResponse,
} from "../../core/schema/index.js"

/** @Owl.Providers.Anthropic.Capabilities - High-fidelity model specifications */
const ANTHROPIC_CAPABILITIES: readonly ProviderCapability[] = [
  {
    providerId: "anthropic",
    modelId: "claude-opus-4-7",
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
    modelId: "claude-sonnet-4-6",
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
    modelId: "claude-haiku-4-5-20251001",
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

/** @Owl.Providers.Anthropic.ErrorMapping - Resilient error translation */
const mapAnthropicError = (
  e: unknown,
):
  | ProviderError
  | ProviderAuthError
  | ProviderRateLimitError
  | ProviderTimeoutError => {
  if (e instanceof Anthropic.AuthenticationError) {
    return new ProviderAuthError({ provider: "anthropic", reason: e.message })
  }
  if (e instanceof Anthropic.RateLimitError) {
    return new ProviderRateLimitError({ provider: "anthropic" })
  }
  if (e instanceof Anthropic.APIConnectionTimeoutError) {
    return new ProviderTimeoutError({
      provider: "anthropic",
      timeoutMs: PROVIDER_TIMEOUTS.DEFAULT_MS,
    })
  }
  if (
    e instanceof Anthropic.APIError &&
    (e.status === HTTP_STATUS.ANTHROPIC_OVERLOADED ||
      e.message.includes('"type":"overloaded_error"'))
  ) {
    return new ProviderError({
      provider: "anthropic",
      message: "Service overloaded — retry after backoff",
      statusCode: HTTP_STATUS.ANTHROPIC_OVERLOADED,
    })
  }
  const statusCode =
    e instanceof Anthropic.APIError ? (e.status as number) : undefined
  return new ProviderError({
    provider: "anthropic",
    message: e instanceof Error ? e.message : String(e),
    ...(statusCode !== undefined ? { statusCode } : {}),
  })
}

/** @Owl.Providers.Anthropic.Adapter - service definition */
export class AnthropicAdapter extends Context.Tag("AnthropicAdapter")<
  AnthropicAdapter,
  LLMProviderService
>() {}

/** @Owl.Providers.Anthropic.Implementation - Production layer logic */
export const AnthropicAdapterLive = Layer.effect(
  AnthropicAdapter,
  Effect.gen(function* () {
    const config = yield* OWL_CONFIG

    /** @Owl.Providers.Anthropic.Client - Anthropic SDK client */
    const client = new Anthropic({ apiKey: config.anthropicApiKey })

    /** @Owl.Providers.Anthropic.Retry - Exponential backoff retry schedule */
    const retrySchedule = Schedule.exponential("1 seconds", 2).pipe(
      Schedule.intersect(Schedule.recurs(RETRY_CONFIG.MAX_ATTEMPTS - 1)),
    )

    const complete = (
      request: InferenceRequest,
    ): Effect.Effect<
      InferenceResponse,
      | ProviderError
      | ProviderAuthError
      | ProviderRateLimitError
      | ProviderTimeoutError
    > =>
      Effect.tryPromise({
        try: async () => {
          const startMs = Date.now()
          const response = await client.messages.create({
            model: request.model,
            max_tokens: request.maxTokens,
            messages: request.messages.map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
            ...(request.systemPrompt ? { system: request.systemPrompt } : {}),
          })

          const content = response.content
            .filter((b) => b.type === "text")
            .map((b) => (b as { type: "text"; text: string }).text)
            .join("")

          return {
            taskId: request.taskId,
            content,
            stopReason: (response.stop_reason ??
              "end_turn") as InferenceResponse["stopReason"],
            usage: {
              inputTokens: response.usage.input_tokens,
              outputTokens: response.usage.output_tokens,
              cacheReadTokens: 0,
              cacheWriteTokens: 0,
            },
            model: response.model,
            provider: "anthropic" as const,
            latencyMs: Date.now() - startMs,
          } satisfies InferenceResponse
        },
        catch: mapAnthropicError,
      }).pipe(Effect.retry(retrySchedule))

    const stream = (request: InferenceRequest) =>
      Stream.async<StreamChunk, ProviderStreamError>((emit) => {
        const run = async () => {
          try {
            const s = client.messages.stream({
              model: request.model,
              max_tokens: request.maxTokens,
              messages: request.messages.map((m) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
              })),
            })

            let index = 0
            for await (const event of s) {
              if (
                event.type === "content_block_delta" &&
                event.delta.type === "text_delta"
              ) {
                await emit.single({
                  type: "text",
                  content: event.delta.text,
                  index: index++,
                })
              }
            }
            await emit.end()
          } catch (e) {
            await emit.fail(
              new ProviderStreamError({ provider: "anthropic", cause: e }),
            )
          }
        }
        void run()
      })

    const countTokens = (text: string, _modelId: string) =>
      Effect.succeed(Math.ceil(text.length / 4))

    const healthCheck = () =>
      Effect.tryPromise({
        try: () =>
          client.messages
            .create({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 1,
              messages: [{ role: "user", content: "ping" }],
            })
            .then(() => true),
        catch: () =>
          new ProviderError({
            provider: "anthropic",
            message: "health check failed",
          }),
      })

    return {
      id: "anthropic",
      capabilities: ANTHROPIC_CAPABILITIES,
      complete,
      stream,
      countTokens,
      healthCheck,
    } satisfies LLMProviderService
  }),
)
