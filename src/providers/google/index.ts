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
import { PROVIDER_CONSTANTS } from "../../core/constants/index.js"
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
 * @Owl.Providers.Google.Capabilities - Multimodal model specifications
 */
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

interface GoogleUsageMetadata {
  readonly promptTokenCount?: number
  readonly candidatesTokenCount?: number
}

interface GoogleResponseLike {
  readonly text: () => string
  readonly usageMetadata?: GoogleUsageMetadata
}

const estimateTextTokens = (text: string): number =>
  Math.ceil(text.length / PROVIDER_CONSTANTS.TOKEN_ESTIMATION_CHARS_PER_TOKEN)

const buildPrompt = (request: InferenceRequest): string =>
  request.messages
    .filter((message) => message.role !== "system")
    .map((message) => message.content)
    .join("\n")

const makeModelParams = (request: InferenceRequest) => ({
  model: request.model,
  generationConfig: {
    maxOutputTokens: request.maxTokens,
  },
  ...(request.systemPrompt !== undefined
    ? { systemInstruction: request.systemPrompt }
    : {}),
})

const usageFromResponse = (
  request: InferenceRequest,
  prompt: string,
  content: string,
  response: GoogleResponseLike,
) => {
  const inputTokens =
    response.usageMetadata?.promptTokenCount ?? estimateTextTokens(prompt)
  const outputTokens =
    response.usageMetadata?.candidatesTokenCount ?? estimateTextTokens(content)

  return {
    inputTokens,
    outputTokens,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    estimatedCostUsd: estimateModelCostUsd(
      GOOGLE_CAPABILITIES,
      request.model,
      inputTokens,
      outputTokens,
    ),
  }
}

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

    const stream = (request: InferenceRequest) =>
      Stream.async<StreamChunk, ProviderStreamError>((emit) => {
        const run = async () => {
          try {
            const model = genAI.getGenerativeModel(makeModelParams(request))
            const prompt = buildPrompt(request)
            const result = await model.generateContentStream(prompt)
            const chunks: string[] = []
            let index = 0

            for await (const chunk of result.stream) {
              const content = chunk.text()
              if (content.length > 0) {
                chunks.push(content)
                await emit.single({ type: "text", content, index: index++ })
              }
            }

            const aggregated = await result.response
            const content = chunks.join("")
            await emit.single({
              type: "usage",
              index,
              usage: usageFromResponse(request, prompt, content, aggregated),
            })
            await emit.end()
          } catch (cause) {
            await emit.fail(
              new ProviderStreamError({ provider: "google", cause }),
            )
          }
        }
        void run()
      })

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
