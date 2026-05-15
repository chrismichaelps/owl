/**
 * @Owl.Providers.OpenAI - OpenAI GPT adapter
 *
 * OpenAI provider supporting GPT-4o and o3 models.
 * Authentication: Requires OPENAI_API_KEY environment variable.
 *
 * Models:
 * - gpt-4o: Fast, capable, supports vision and function calling
 * - o3: Latest reasoning model, larger context window
 *
 * @example
 * // Register in runtime.ts
 * const router = yield* ProviderRouter
 * yield* registerProvider(router, OpenAIAdapterLive)
 */
import OpenAI from "openai"
import { Context, Effect, Layer, Schedule } from "effect"
import * as Stream from "effect/Stream"
import { ProviderError, ProviderStreamError } from "../../core/errors/index.js"
import { OWL_CONFIG } from "../../core/config/index.js"
import { PROVIDER_CONSTANTS, RETRY_CONFIG } from "../../core/constants/index.js"
import { estimateModelCostUsd } from "../cost.js"
import type {
  LLMProviderService,
  ProviderCapability,
  StreamChunk,
} from "../types.js"
import type {
  InferenceRequest,
  InferenceResponse,
} from "../../core/schema/index.js"

/**
 * @Owl.Providers.OpenAI.Capabilities - Model specifications and competitive pricing
 */
const OPENAI_CAPABILITIES: readonly ProviderCapability[] = [
  {
    providerId: "openai",
    modelId: "gpt-4o",
    contextWindow: 128_000,
    maxOutputTokens: 16_384,
    inputCostPer1k: 0.0025,
    outputCostPer1k: 0.01,
    supportsStreaming: true,
    reasoningDepth: "high",
    supportsFunctionCalling: true,
    supportsVision: true,
  },
  {
    providerId: "openai",
    modelId: "o3",
    contextWindow: 200_000,
    maxOutputTokens: 100_000,
    inputCostPer1k: 0.002,
    outputCostPer1k: 0.008,
    supportsStreaming: true,
    reasoningDepth: "high",
    supportsFunctionCalling: true,
    supportsVision: true,
  },
]

const estimateTextTokens = (text: string): number =>
  Math.ceil(text.length / PROVIDER_CONSTANTS.TOKEN_ESTIMATION_CHARS_PER_TOKEN)

const buildMessages = (request: InferenceRequest) => [
  ...(request.systemPrompt
    ? [{ role: "system" as const, content: request.systemPrompt }]
    : []),
  ...request.messages.map((message) => ({
    role: message.role as "user" | "assistant",
    content: message.content,
  })),
]

/** @Owl.Providers.OpenAI.Adapter - service definition */
export class OpenAIAdapter extends Context.Tag("OpenAIAdapter")<
  OpenAIAdapter,
  LLMProviderService
>() {}

/**
 * @Owl.Providers.OpenAI.Implementation - Production layer logic
 *
 * Uses Effect.retry with exponential backoff for resilience.
 * Streaming uses Effect.Stream.async for non-blocking chunk emission.
 */
export const OpenAIAdapterLive = Layer.effect(
  OpenAIAdapter,
  Effect.gen(function* () {
    const config = yield* OWL_CONFIG

    if (config.openaiApiKey === undefined) {
      return {
        id: "openai",
        capabilities: OPENAI_CAPABILITIES,
        complete: () =>
          Effect.fail(
            new ProviderError({
              provider: "openai",
              message: "OPENAI_API_KEY not configured",
            }),
          ),
        stream: () =>
          Stream.fail(
            new ProviderStreamError({
              provider: "openai",
              cause: "OPENAI_API_KEY not configured",
            }),
          ),
        countTokens: (text: string, _model: string) =>
          Effect.succeed(estimateTextTokens(text)),
        healthCheck: () =>
          Effect.fail(
            new ProviderError({
              provider: "openai",
              message: "OPENAI_API_KEY not configured",
            }),
          ),
      } satisfies LLMProviderService
    }

    /** @Owl.Providers.OpenAI.Client - OpenAI SDK client */
    const client = new OpenAI({ apiKey: config.openaiApiKey })

    /** @Owl.Providers.OpenAI.Retry - Exponential backoff retry schedule */
    const retrySchedule = Schedule.exponential("1 seconds", 2).pipe(
      Schedule.intersect(Schedule.recurs(RETRY_CONFIG.MAX_ATTEMPTS - 1)),
    )

    const complete = (
      request: InferenceRequest,
    ): Effect.Effect<InferenceResponse, ProviderError> =>
      Effect.tryPromise({
        try: async () => {
          const startMs = Date.now()
          const response = await client.chat.completions.create({
            model: request.model,
            max_tokens: request.maxTokens,
            messages: buildMessages(request),
          })

          const content = response.choices[0]?.message.content ?? ""
          const usage = response.usage

          return {
            taskId: request.taskId,
            content,
            stopReason: "end_turn" as const,
            usage: {
              inputTokens: usage?.prompt_tokens ?? 0,
              outputTokens: usage?.completion_tokens ?? 0,
              cacheReadTokens: 0,
              cacheWriteTokens: 0,
              estimatedCostUsd: estimateModelCostUsd(
                OPENAI_CAPABILITIES,
                response.model,
                usage?.prompt_tokens ?? 0,
                usage?.completion_tokens ?? 0,
              ),
            },
            model: response.model,
            provider: "openai" as const,
            latencyMs: Date.now() - startMs,
          } satisfies InferenceResponse
        },
        catch: (e) =>
          new ProviderError({
            provider: "openai",
            message: e instanceof Error ? e.message : String(e),
          }),
      }).pipe(Effect.retry(retrySchedule))

    const stream = (request: InferenceRequest) =>
      Stream.async<StreamChunk, ProviderStreamError>((emit) => {
        const run = async () => {
          try {
            const s = await client.chat.completions.create({
              model: request.model,
              max_tokens: request.maxTokens,
              messages: buildMessages(request),
              stream: true,
              stream_options: { include_usage: true },
            })
            let index = 0
            for await (const chunk of s) {
              const content = chunk.choices[0]?.delta.content
              if (content) {
                await emit.single({ type: "text", content, index: index++ })
              }
              if (chunk.usage != null) {
                const inputTokens = chunk.usage.prompt_tokens
                const outputTokens = chunk.usage.completion_tokens
                await emit.single({
                  type: "usage",
                  index,
                  usage: {
                    inputTokens,
                    outputTokens,
                    cacheReadTokens: 0,
                    cacheWriteTokens: 0,
                    estimatedCostUsd: estimateModelCostUsd(
                      OPENAI_CAPABILITIES,
                      request.model,
                      inputTokens,
                      outputTokens,
                    ),
                  },
                })
              }
            }
            await emit.end()
          } catch (e) {
            await emit.fail(
              new ProviderStreamError({ provider: "openai", cause: e }),
            )
          }
        }
        void run()
      })

    return {
      id: "openai",
      capabilities: OPENAI_CAPABILITIES,
      complete,
      stream,
      countTokens: (_text, _model) => Effect.succeed(estimateTextTokens(_text)),
      healthCheck: () => Effect.succeed(true),
    } satisfies LLMProviderService
  }),
)
