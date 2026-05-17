/**
 * @Owl.Providers.Google - Google Gemini adapter
 *
 * Google's Gemini models offer excellent cost efficiency and large context windows.
 *
 * Authentication: Requires GOOGLE_API_KEY environment variable.
 * If not configured, all operations fail with ProviderError.
 *
 * Models:
 * - gemini-2.5-flash: Fast, affordable, multimodal
 *
 * @example
 * // Not configured by default — set GOOGLE_API_KEY to enable
 */
import { GoogleGenerativeAI } from "@google/generative-ai"
import { Context, Effect, Layer } from "effect"
import * as Stream from "effect/Stream"
import { ProviderError, ProviderStreamError } from "../../core/errors/index.js"
import { OWL_CONFIG } from "../../core/config/index.js"
import type { LLMProviderService } from "../types.js"
import type {
  InferenceRequest,
  InferenceResponse,
} from "../../core/schema/index.js"
import {
  buildPrompt,
  estimateTextTokens,
  GOOGLE_CAPABILITIES,
  makeModelParams,
  usageFromResponse,
} from "./runtime.js"
import { makeGoogleStream } from "./stream.js"

/** @Owl.Providers.Google.Adapter - Effect-TS service definition */
export class GoogleAdapter extends Context.Tag("GoogleAdapter")<
  GoogleAdapter,
  LLMProviderService
>() {}

/**
 * @Owl.Providers.Google.Implementation - Production layer logic
 *
 * Falls back gracefully when GOOGLE_API_KEY is not set.
 * Streaming emits text chunks and terminal usage metadata.
 */
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
          const model = genAI.getGenerativeModel(makeModelParams(request))
          const prompt = buildPrompt(request)
          const result = await model.generateContent(prompt)
          const text = result.response.text()
          const usage = usageFromResponse(
            request,
            prompt,
            text,
            result.response,
          )
          return {
            taskId: request.taskId,
            content: text,
            stopReason: "end_turn" as const,
            usage,
            model: request.model,
            provider: "google" as const,
            latencyMs: Date.now() - startMs,
          } satisfies InferenceResponse
        },
        catch: (e) =>
          new ProviderError({ provider: "google", message: String(e) }),
      })

    const stream = makeGoogleStream(genAI)

    return {
      id: "google",
      capabilities: GOOGLE_CAPABILITIES,
      complete,
      stream,
      countTokens: (_text, _model) => Effect.succeed(estimateTextTokens(_text)),
      healthCheck: () => Effect.succeed(true),
    } satisfies LLMProviderService
  }),
)
