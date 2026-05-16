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
import { Chunk, Context, Data, Effect, Layer } from "effect"
import * as Stream from "effect/Stream"
import { ProviderError, ProviderStreamError } from "../../core/errors/index.js"
import { OWL_CONFIG } from "../../core/config/index.js"
import { PROVIDER_CONSTANTS, XAI_MODELS } from "../../core/constants/index.js"
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
 * @Owl.Providers.xAI.Capabilities - Grok model specifications
 */
const XAI_CAPABILITIES: readonly ProviderCapability[] = [
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

const estimateTextTokens = (text: string): number =>
  Math.ceil(text.length / PROVIDER_CONSTANTS.TOKEN_ESTIMATION_CHARS_PER_TOKEN)

const buildMessages = (request: InferenceRequest) => {
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

    if (config.xaiApiKey === undefined) {
      return {
        id: "xai",
        capabilities: XAI_CAPABILITIES,
        complete: () =>
          Effect.fail(
            new ProviderError({
              provider: "xai",
              message: "XAI_API_KEY not configured",
            }),
          ),
        stream: () =>
          Stream.fail(
            new ProviderStreamError({
              provider: "xai",
              cause: "XAI_API_KEY not configured",
            }),
          ),
        countTokens: (text: string, _model: string) =>
          Effect.succeed(estimateTextTokens(text)),
        healthCheck: () =>
          Effect.fail(
            new ProviderError({
              provider: "xai",
              message: "XAI_API_KEY not configured",
            }),
          ),
      } satisfies LLMProviderService
    }

    /** @Owl.Providers.xAI.Client - OpenAI-compatible xAI client */
    const client = new OpenAI({
      apiKey: config.xaiApiKey,
      baseURL: PROVIDER_CONSTANTS.XAI_BASE_URL,
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
            messages: buildMessages(request),
          })
          return {
            taskId: request.taskId,
            content: response.choices[0]?.message.content ?? "",
            stopReason: "end_turn" as const,
            usage: Data.struct({
              inputTokens: response.usage?.prompt_tokens ?? 0,
              outputTokens: response.usage?.completion_tokens ?? 0,
              cacheReadTokens: 0,
              cacheWriteTokens: 0,
              estimatedCostUsd: estimateModelCostUsd(
                XAI_CAPABILITIES,
                response.model,
                response.usage?.prompt_tokens ?? 0,
                response.usage?.completion_tokens ?? 0,
              ),
            }),
            model: response.model,
            provider: "xai" as const,
            latencyMs: Date.now() - startMs,
          } satisfies InferenceResponse
        },
        catch: (e) =>
          new ProviderError({ provider: "xai", message: String(e) }),
      })

    const stream = (request: InferenceRequest) =>
      Stream.async<StreamChunk, ProviderStreamError>((emit) => {
        const run = async () => {
          try {
            const chunks = await client.chat.completions.create({
              model: request.model,
              max_tokens: request.maxTokens,
              messages: buildMessages(request),
              stream: true,
              stream_options: { include_usage: true },
            })
            let index = 0
            for await (const chunk of chunks) {
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
                  usage: Data.struct({
                    inputTokens,
                    outputTokens,
                    cacheReadTokens: 0,
                    cacheWriteTokens: 0,
                    estimatedCostUsd: estimateModelCostUsd(
                      XAI_CAPABILITIES,
                      request.model,
                      inputTokens,
                      outputTokens,
                    ),
                  }),
                })
              }
            }
            await emit.end()
          } catch (cause) {
            await emit.fail(new ProviderStreamError({ provider: "xai", cause }))
          }
        }
        void run()
      })

    return {
      id: "xai",
      capabilities: XAI_CAPABILITIES,
      complete,
      stream,
      countTokens: (_text, _model) => Effect.succeed(estimateTextTokens(_text)),
      healthCheck: () => Effect.succeed(true),
    } satisfies LLMProviderService
  }),
)
