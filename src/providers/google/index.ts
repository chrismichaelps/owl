/** @Owl.Providers.Google - Google Gemini adapter */
import { GoogleGenerativeAI } from "@google/generative-ai"
import { Context, Effect, Layer } from "effect"
import * as Stream from "effect/Stream"
import { ProviderError, ProviderStreamError } from "../../core/errors/index.js"
import { OWL_CONFIG } from "../../core/config/index.js"
import type { LLMProviderService, ProviderCapability } from "../types.js"
import type {
  InferenceRequest,
  InferenceResponse,
} from "../../core/schema/index.js"

const GOOGLE_CAPABILITIES: readonly ProviderCapability[] = [
  {
    providerId: "google",
    modelId: "gemini-2.5-flash",
    contextWindow: 1_048_576,
    maxOutputTokens: 8_192,
    inputCostPer1k: 0.0001,
    outputCostPer1k: 0.0004,
    supportsStreaming: true,
    reasoningDepth: "medium",
    supportsFunctionCalling: true,
    supportsVision: true,
  },
]

export class GoogleAdapter extends Context.Tag("GoogleAdapter")<
  GoogleAdapter,
  LLMProviderService
>() {}

export const GoogleAdapterLive = Layer.effect(
  GoogleAdapter,
  Effect.gen(function* () {
    const config = yield* OWL_CONFIG

    if (!config.googleApiKey) {
      return {
        id: "google",
        capabilities: GOOGLE_CAPABILITIES,
        complete: () =>
          Effect.fail(
            new ProviderError({
              provider: "google",
              message: "GOOGLE_API_KEY not configured",
            }),
          ),
        stream: () =>
          Stream.fail(
            new ProviderStreamError({
              provider: "google",
              cause: "not configured",
            }),
          ),
        countTokens: () => Effect.succeed(0),
        healthCheck: () =>
          Effect.fail(
            new ProviderError({
              provider: "google",
              message: "not configured",
            }),
          ),
      } satisfies LLMProviderService
    }

    const genAI = new GoogleGenerativeAI(config.googleApiKey)

    const complete = (
      request: InferenceRequest,
    ): Effect.Effect<InferenceResponse, ProviderError> =>
      Effect.tryPromise({
        try: async () => {
          const startMs = Date.now()
          const model = genAI.getGenerativeModel({ model: request.model })
          const prompt = request.messages
            .filter((m) => m.role !== "system")
            .map((m) => m.content)
            .join("\n")
          const result = await model.generateContent(prompt)
          const text = result.response.text()
          return {
            taskId: request.taskId,
            content: text,
            stopReason: "end_turn" as const,
            usage: {
              inputTokens: 0,
              outputTokens: 0,
              cacheReadTokens: 0,
              cacheWriteTokens: 0,
            },
            model: request.model,
            provider: "google" as const,
            latencyMs: Date.now() - startMs,
          } satisfies InferenceResponse
        },
        catch: (e) =>
          new ProviderError({ provider: "google", message: String(e) }),
      })

    return {
      id: "google",
      capabilities: GOOGLE_CAPABILITIES,
      complete,
      stream: (_req) => Stream.empty,
      countTokens: (_text, _model) =>
        Effect.succeed(Math.ceil(_text.length / 4)),
      healthCheck: () => Effect.succeed(true),
    } satisfies LLMProviderService
  }),
)
