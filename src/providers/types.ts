/** @Owl.Providers.Types - LLMProvider interface and streaming contracts */
import { Context, Schema } from "effect"
import type { Effect } from "effect"
import type * as Stream from "effect/Stream"
import type {
  InferenceRequest,
  InferenceResponse,
} from "../core/schema/index.js"
import type {
  ProviderError,
  ProviderStreamError,
  ProviderTimeoutError,
  ProviderAuthError,
  ProviderRateLimitError,
} from "../core/errors/index.js"

/** @Owl.Providers.Types.Capability - Model and pricing metadata schema */
export const ProviderCapabilitySchema = Schema.Struct({
  providerId: Schema.String,
  modelId: Schema.String,
  contextWindow: Schema.Number,
  maxOutputTokens: Schema.Number,
  inputCostPer1k: Schema.Number,
  outputCostPer1k: Schema.Number,
  supportsStreaming: Schema.Boolean,
  reasoningDepth: Schema.Literal("low", "medium", "high"),
  supportsFunctionCalling: Schema.Boolean,
  supportsVision: Schema.Boolean,
})
export type ProviderCapability = Schema.Schema.Type<
  typeof ProviderCapabilitySchema
>

/** @Owl.Providers.Types.Routing - Selection context and constraints */
export const RoutingContextSchema = Schema.Struct({
  taskId: Schema.String,
  mode: Schema.String,
  estimatedInputTokens: Schema.Number,
  requiresReasoning: Schema.Boolean,
  requiresVision: Schema.Boolean,
  latencyBudgetMs: Schema.Number,
  costBudgetUsd: Schema.optional(Schema.Number),
  preferredProvider: Schema.optional(Schema.String),
})
export type RoutingContext = Schema.Schema.Type<typeof RoutingContextSchema>

/** @Owl.Providers.Types.Streaming - Chunk-based response contracts */
export const StreamChunkSchema = Schema.Struct({
  type: Schema.Literal("text", "thinking", "tool_use", "stop"),
  content: Schema.optional(Schema.String),
  index: Schema.Number,
  usage: Schema.optional(
    Schema.Struct({
      inputTokens: Schema.Number,
      outputTokens: Schema.Number,
    }),
  ),
})
export type StreamChunk = Schema.Schema.Type<typeof StreamChunkSchema>

/** @Owl.Providers.Types.Error - Union of all provider error types */
export type AnyProviderError =
  | ProviderError
  | ProviderStreamError
  | ProviderTimeoutError
  | ProviderAuthError
  | ProviderRateLimitError

/** @Owl.Providers.Types.Service - The unified LLM adapter interface */
export interface LLMProviderService {
  readonly id: string
  readonly capabilities: readonly ProviderCapability[]

  readonly complete: (
    request: InferenceRequest,
  ) => Effect.Effect<InferenceResponse, AnyProviderError>

  readonly stream: (
    request: InferenceRequest,
  ) => Stream.Stream<StreamChunk, AnyProviderError>

  readonly countTokens: (
    text: string,
    modelId: string,
  ) => Effect.Effect<number, ProviderError>

  readonly healthCheck: () => Effect.Effect<boolean, ProviderError>
}

/** @Owl.Providers.Types.Tag - Service tag for LLM providers */
export class LLMProvider extends Context.Tag("LLMProvider")<
  LLMProvider,
  LLMProviderService
>() {}

export const RoutingDecisionSchema = Schema.Struct({
  selectedProvider: Schema.String,
  selectedModel: Schema.String,
  score: Schema.Number,
  fallbackProviders: Schema.Array(Schema.String),
  reasoning: Schema.String,
  estimatedCostUsd: Schema.Number,
})
export type RoutingDecision = Schema.Schema.Type<typeof RoutingDecisionSchema>
