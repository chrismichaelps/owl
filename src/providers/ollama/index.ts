/** @Owl.Providers.Ollama - Local Ollama adapter for privacy mode */
import { Context, Effect, Layer } from "effect"
import * as Stream from "effect/Stream"
import { ProviderError } from "../../core/errors/index.js"
import { OWL_CONFIG } from "../../core/config/index.js"
import type { LLMProviderService, ProviderCapability } from "../types.js"
import type { InferenceRequest, InferenceResponse } from "../../core/schema/index.js"

const OLLAMA_CAPABILITIES: readonly ProviderCapability[] = [
  {
    providerId: "ollama",
    modelId: "llama3.2",
    contextWindow: 128_000,
    maxOutputTokens: 4_096,
    inputCostPer1k: 0,
    outputCostPer1k: 0,
    supportsStreaming: true,
    reasoningDepth: "medium",
    supportsFunctionCalling: false,
    supportsVision: false,
  },
  {
    providerId: "ollama",
    modelId: "codellama",
    contextWindow: 16_000,
    maxOutputTokens: 4_096,
    inputCostPer1k: 0,
    outputCostPer1k: 0,
    supportsStreaming: true,
    reasoningDepth: "medium",
    supportsFunctionCalling: false,
    supportsVision: false,
  },
]

export class OllamaAdapter extends Context.Tag("OllamaAdapter")<
  OllamaAdapter,
  LLMProviderService
>() {}

export const OllamaAdapterLive = Layer.effect(
  OllamaAdapter,
  Effect.gen(function* () {
    const config = yield* OWL_CONFIG
    const baseUrl = config.ollamaBaseUrl

    const complete = (request: InferenceRequest): Effect.Effect<InferenceResponse, ProviderError> =>
      Effect.tryPromise({
        try: async () => {
          const startMs = Date.now()
          const response = await fetch(`${baseUrl}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: request.model,
              prompt: request.messages.map((m) => m.content).join("\n"),
              stream: false,
            }),
          })
          if (!response.ok) {
            throw new Error(`Ollama error: ${response.statusText}`)
          }
          const data = (await response.json()) as { response: string }
          return {
            taskId: request.taskId,
            content: data.response,
            stopReason: "end_turn" as const,
            usage: { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 },
            model: request.model,
            provider: "ollama" as const,
            latencyMs: Date.now() - startMs,
          } satisfies InferenceResponse
        },
        catch: (e) => new ProviderError({ provider: "ollama", message: String(e) }),
      })

    const healthCheck = (): Effect.Effect<boolean, ProviderError> =>
      Effect.tryPromise({
        try: async () => {
          const response = await fetch(`${baseUrl}/api/tags`)
          return response.ok
        },
        catch: (e) => new ProviderError({ provider: "ollama", message: String(e) }),
      })

    return {
      id: "ollama",
      capabilities: OLLAMA_CAPABILITIES,
      complete,
      stream: () => Stream.empty,
      countTokens: (_text, _model) => Effect.succeed(Math.ceil(_text.length / 4)),
      healthCheck,
    } satisfies LLMProviderService
  }),
)
