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
import { Chunk, Context, Data, Effect, Layer, Schema } from "effect"
import * as Stream from "effect/Stream"
import { ProviderError, ProviderStreamError } from "../../core/errors/index.js"
import { OWL_CONFIG } from "../../core/config/index.js"
import {
  OLLAMA_MODELS,
  PROVIDER_CONSTANTS,
} from "../../core/constants/index.js"
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
import {
  OllamaGenerateResponseSchema,
  OllamaStreamResponseSchema,
} from "./schema.js"
import type { OllamaStreamResponse } from "./schema.js"

/**
 * @Owl.Providers.Ollama.Capabilities - Local model specifications
 */
const OLLAMA_CAPABILITIES: readonly ProviderCapability[] = [
  Data.struct({
    providerId: "ollama",
    modelId: OLLAMA_MODELS.LLAMA_3_2,
    contextWindow: 128_000,
    maxOutputTokens: 4_096,
    inputCostPer1k: 0,
    outputCostPer1k: 0,
    supportsStreaming: true,
    reasoningDepth: "medium",
    supportsFunctionCalling: false,
    supportsVision: false,
  }),
  Data.struct({
    providerId: "ollama",
    modelId: OLLAMA_MODELS.CODE_LLAMA,
    contextWindow: 16_000,
    maxOutputTokens: 4_096,
    inputCostPer1k: 0,
    outputCostPer1k: 0,
    supportsStreaming: true,
    reasoningDepth: "medium",
    supportsFunctionCalling: false,
    supportsVision: false,
  }),
]

const decodeGenerateResponse = Schema.decodeUnknownSync(
  OllamaGenerateResponseSchema,
)

const decodeStreamResponse = Schema.decodeUnknownSync(
  OllamaStreamResponseSchema,
)

const estimateTextTokens = (text: string): number =>
  Math.ceil(text.length / PROVIDER_CONSTANTS.TOKEN_ESTIMATION_CHARS_PER_TOKEN)

const buildPrompt = (request: InferenceRequest): string =>
  Chunk.toReadonlyArray(
    Chunk.map(
      Chunk.fromIterable(request.messages),
      (message) => message.content,
    ),
  ).join("\n")

const parseStreamLine = (line: string): OllamaStreamResponse =>
  decodeStreamResponse(JSON.parse(line) as unknown)

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
      Effect.tryPromise({
        try: async () => {
          const startMs = Date.now()
          const response = await fetch(`${baseUrl}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: request.model,
              prompt: buildPrompt(request),
              stream: false,
            }),
          })
          if (!response.ok) {
            throw new Error(`Ollama error: ${response.statusText}`)
          }
          const rawData = (await response.json()) as unknown
          const data = decodeGenerateResponse(rawData)
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
        },
        catch: (e) =>
          new ProviderError({ provider: "ollama", message: String(e) }),
      })

    const stream = (request: InferenceRequest) =>
      Stream.async<StreamChunk, ProviderStreamError>((emit) => {
        const run = async () => {
          try {
            const prompt = buildPrompt(request)
            const response = await fetch(`${baseUrl}/api/generate`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                model: request.model,
                prompt,
                stream: true,
              }),
            })

            if (!response.ok) {
              throw new Error(`Ollama stream error: ${response.statusText}`)
            }
            if (response.body === null) {
              throw new Error("Ollama stream response body is empty")
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let chunks = Chunk.empty<string>()
            let buffer = ""
            let index = 0

            const emitLine = async (line: string): Promise<void> => {
              const trimmed = line.trim()
              if (trimmed.length === 0) return

              const event = parseStreamLine(trimmed)
              if (event.response !== undefined && event.response.length > 0) {
                chunks = Chunk.append(chunks, event.response)
                await emit.single({
                  type: "text",
                  content: event.response,
                  index: index++,
                })
              }
            }

            let streamDone = false
            while (!streamDone) {
              const read = await reader.read()
              streamDone = read.done
              buffer += decoder.decode(read.value, { stream: !read.done })
              const lines = buffer.split(
                PROVIDER_CONSTANTS.OLLAMA_STREAM_DELIMITER,
              )
              buffer = lines.at(-1) ?? ""
              const completedLines = lines.slice(0, -1)

              for (const line of completedLines) {
                await emitLine(line)
              }
            }

            await emitLine(buffer)
            const content = Chunk.toReadonlyArray(chunks).join("")
            const inputTokens = estimateTextTokens(prompt)
            const outputTokens = estimateTextTokens(content)
            await emit.single({
              type: "usage",
              index,
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
            })
            await emit.end()
          } catch (cause) {
            await emit.fail(
              new ProviderStreamError({ provider: "ollama", cause }),
            )
          }
        }
        void run()
      })

    const healthCheck = (): Effect.Effect<boolean, ProviderError> =>
      Effect.tryPromise({
        try: async () => {
          const response = await fetch(`${baseUrl}/api/tags`)
          return response.ok
        },
        catch: (e) =>
          new ProviderError({ provider: "ollama", message: String(e) }),
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
