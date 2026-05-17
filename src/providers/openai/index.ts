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
import { Context, Data, Effect, Layer, Schedule } from "effect"
import * as Stream from "effect/Stream"
import { ProviderError, ProviderStreamError } from "../../core/errors/index.js"
import { OWL_CONFIG } from "../../core/config/index.js"
import { RETRY_CONFIG } from "../../core/constants/index.js"
import { estimateModelCostUsd } from "../cost.js"
import type { LLMProviderService } from "../types.js"
import type {
  InferenceRequest,
  InferenceResponse,
} from "../../core/schema/index.js"
import {
  buildMessages,
  estimateTextTokens,
  OPENAI_CAPABILITIES,
} from "./runtime.js"
import { makeOpenAIStream } from "./stream.js"

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
            max_completion_tokens: request.maxTokens,
            messages: buildMessages(request),
          })

          const content = response.choices[0]?.message.content ?? ""
          const usage = response.usage

          return {
            taskId: request.taskId,
            content,
            stopReason: "end_turn" as const,
            usage: Data.struct({
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
            }),
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

    const stream = makeOpenAIStream(client)

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
