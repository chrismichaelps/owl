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
import { Context, Data, Effect, Layer } from "effect"
import * as Stream from "effect/Stream"
import { ProviderError, ProviderStreamError } from "../../core/errors/index.js"
import { OWL_CONFIG } from "../../core/config/index.js"
import { PROVIDER_CONSTANTS } from "../../core/constants/index.js"
import { estimateModelCostUsd } from "../cost.js"
import type { LLMProviderService } from "../types.js"
import type {
  InferenceRequest,
  InferenceResponse,
} from "../../core/schema/index.js"
import {
  buildMessages,
  estimateTextTokens,
  XAI_CAPABILITIES,
} from "./runtime.js"
import { makeXAIStream } from "./stream.js"
import { decodeOpenAICompatibleChatCompletion } from "../openaiCompatible/schema.js"

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
          const decoded = decodeOpenAICompatibleChatCompletion(response)
          return {
            taskId: request.taskId,
            content: decoded.choices[0]?.message.content ?? "",
            stopReason: "end_turn" as const,
            usage: Data.struct({
              inputTokens: decoded.usage?.prompt_tokens ?? 0,
              outputTokens: decoded.usage?.completion_tokens ?? 0,
              cacheReadTokens: 0,
              cacheWriteTokens: 0,
              estimatedCostUsd: estimateModelCostUsd(
                XAI_CAPABILITIES,
                decoded.model,
                decoded.usage?.prompt_tokens ?? 0,
                decoded.usage?.completion_tokens ?? 0,
              ),
            }),
            model: decoded.model,
            provider: "xai" as const,
            latencyMs: Date.now() - startMs,
          } satisfies InferenceResponse
        },
        catch: (e) =>
          new ProviderError({ provider: "xai", message: String(e) }),
      })

    const stream = makeXAIStream(client)

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
