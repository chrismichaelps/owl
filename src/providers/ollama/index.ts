/**
 * @Owl.Providers.Ollama - Local Ollama adapter for privacy mode
 *
 * Ollama runs open-source models locally on your machine. This provider enables:
 * - Privacy: No data leaves your machine
 * - Cost: Free inference (GPU/CPU costs only)
 * - Offline: Works without internet
 *
 * Authentication: Requires OLLAMA_BASE_URL (default: http://localhost:11434).
 *
 * Models (depends on what's running locally):
 * - llama3.2: General purpose
 * - codellama: Code-specialized
 *
 * @example
 * # In terminal:
 * ollama serve
 * ollama pull llama3.2
 *
 * # In Owl:
 * OLLAMA_BASE_URL=http://localhost:11434 owl "my task"
 */
import { Context, Data, Effect, Layer } from "effect"
import { OWL_CONFIG } from "../../core/config/index.js"
import { estimateModelCostUsd } from "../cost.js"
import type { ProviderError } from "../../core/errors/index.js"
import type { LLMProviderService } from "../types.js"
import type {
  InferenceRequest,
  InferenceResponse,
} from "../../core/schema/index.js"
import {
  buildPrompt,
  decodeGenerateResponse,
  estimateTextTokens,
  ollamaGenerateUrl,
  ollamaTagsUrl,
  OLLAMA_CAPABILITIES,
  providerError,
} from "./runtime.js"
import { makeOllamaStream } from "./stream.js"

/** @Owl.Providers.Ollama.Adapter - Effect-TS service definition */
export class OllamaAdapter extends Context.Tag("OllamaAdapter")<
  OllamaAdapter,
  LLMProviderService
>() {}

/**
 * @Owl.Providers.Ollama.Implementation - Production layer logic
 *
 * Uses native fetch for local API calls (no SDK required).
 * Health check verifies Ollama server is running.
 */
export const OllamaAdapterLive = Layer.effect(
  OllamaAdapter,
  Effect.gen(function* () {
    const config = yield* OWL_CONFIG

    /** @Owl.Providers.Ollama.BaseUrl - Local Ollama server endpoint */
    const baseUrl = config.ollamaBaseUrl

    const complete = (
      request: InferenceRequest,
    ): Effect.Effect<InferenceResponse, ProviderError> =>
      Effect.gen(function* () {
        const startMs = Date.now()
        const response = yield* Effect.tryPromise({
          try: () =>
            fetch(ollamaGenerateUrl(baseUrl), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                model: request.model,
                prompt: buildPrompt(request),
                stream: false,
              }),
            }),
          catch: (e) => providerError(String(e)),
        })
        if (!response.ok) {
          return yield* Effect.fail(
            providerError("Ollama error: " + response.statusText),
          )
        }
        const rawData = yield* Effect.tryPromise({
          try: () => response.json() as Promise<unknown>,
          catch: (e) => providerError(String(e)),
        })
        const data = yield* Effect.try({
          try: () => decodeGenerateResponse(rawData),
          catch: (e) => providerError(String(e)),
        })
        const prompt = buildPrompt(request)
        const inputTokens = estimateTextTokens(prompt)
        const outputTokens = estimateTextTokens(data.response)
        return {
          taskId: request.taskId,
          content: data.response,
          stopReason: "end_turn" as const,
          usage: Data.struct({
            inputTokens,
            outputTokens,
            cacheReadTokens: 0,
            cacheWriteTokens: 0,
            estimatedCostUsd: estimateModelCostUsd(
              OLLAMA_CAPABILITIES,
              request.model,
              inputTokens,
              outputTokens,
            ),
          }),
          model: request.model,
          provider: "ollama" as const,
          latencyMs: Date.now() - startMs,
        } satisfies InferenceResponse
      })

    const stream = makeOllamaStream(baseUrl)

    const healthCheck = (): Effect.Effect<boolean, ProviderError> =>
      Effect.tryPromise({
        try: async () => {
          const response = await fetch(ollamaTagsUrl(baseUrl))
          return response.ok
        },
        catch: (e) => providerError(String(e)),
      })

    return {
      id: "ollama",
      capabilities: OLLAMA_CAPABILITIES,
      complete,
      stream,
      countTokens: (_text, _model) => Effect.succeed(estimateTextTokens(_text)),
      healthCheck,
    } satisfies LLMProviderService
  }),
)
