/** @Owl.Providers.Ollama.Runtime - Local model helpers and contracts */
import { Chunk, Data, Schema } from "effect"
import {
  OLLAMA_MODELS,
  PROVIDER_CONSTANTS,
} from "../../core/constants/index.js"
import { ProviderError, ProviderStreamError } from "../../core/errors/index.js"
import type { InferenceRequest } from "../../core/schema/index.js"
import type { ProviderCapability } from "../types.js"
import {
  OllamaGenerateResponseSchema,
  OllamaStreamResponseSchema,
} from "./schema.js"
import type { OllamaStreamResponse } from "./schema.js"

/** @Owl.Providers.Ollama.Capabilities - Local model specifications */
export const OLLAMA_CAPABILITIES: readonly ProviderCapability[] = [
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

export const decodeGenerateResponse = Schema.decodeUnknownSync(
  OllamaGenerateResponseSchema,
)

const decodeStreamResponse = Schema.decodeUnknownSync(
  OllamaStreamResponseSchema,
)

export const estimateTextTokens = (text: string): number =>
  Math.ceil(text.length / PROVIDER_CONSTANTS.TOKEN_ESTIMATION_CHARS_PER_TOKEN)

export const buildPrompt = (request: InferenceRequest): string =>
  Chunk.toReadonlyArray(
    Chunk.map(
      Chunk.fromIterable(request.messages),
      (message) => message.content,
    ),
  ).join("\n")

export const parseStreamLine = (line: string): OllamaStreamResponse =>
  decodeStreamResponse(JSON.parse(line) as unknown)

export const ollamaGenerateUrl = (baseUrl: string): string =>
  baseUrl + PROVIDER_CONSTANTS.OLLAMA_GENERATE_PATH

export const ollamaTagsUrl = (baseUrl: string): string =>
  baseUrl + PROVIDER_CONSTANTS.OLLAMA_TAGS_PATH

export const providerError = (message: string): ProviderError =>
  new ProviderError({ provider: "ollama", message })

export const providerStreamError = (cause: unknown): ProviderStreamError =>
  new ProviderStreamError({ provider: "ollama", cause })
