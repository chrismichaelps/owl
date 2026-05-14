/**
 * @Owl.Providers.Types - LLMProvider interface and streaming contracts
 *
 * Defines the unified interface that all LLM providers must implement.
 * This enables the ProviderRouter to select and call providers without
 * knowing implementation details.
 *
 * Design principles:
 * - All providers expose the same interface (complete, stream, countTokens, healthCheck)
 * - Each provider declares capabilities (context window, pricing, reasoning depth, etc.)
 * - Providers are registered at runtime, not compile time
 *
 * @example
 * // Provider registration in runtime.ts
 * registerProvider(router, OpenAIAdapterLive)
 *
 * // Provider routing decision
 * const decision = yield* Effect.flatMap(ProviderRouter, (r) =>
 *   r.route({ taskId: "1", mode: "deep", estimatedInputTokens: 5000, ... })
 * )
 */
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

/**
 * @Owl.Providers.Types.Capability - Model and pricing metadata schema
 *
 * Each model a provider supports is declared with its capabilities.
 * The router uses these to select the best provider for a task.
 *
 * @example
 * const cap: ProviderCapability = {
 *   providerId: "anthropic",
 *   modelId: "claude-opus-4-7",
 *   contextWindow: 1_000_000,
 *   maxOutputTokens: 128_000,
 *   inputCostPer1k: 0.005,
 *   outputCostPer1k: 0.025,
 *   supportsStreaming: true,
 *   reasoningDepth: "high",
 *   supportsFunctionCalling: true,
 *   supportsVision: true,
 * }
 */
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

/**
 * @Owl.Providers.Types.Routing - Selection context and constraints
 *
 * Passed to the router to determine which provider/model to use.
 *
 * @example
 * const ctx: RoutingContext = {
 *   taskId: "task-1",
 *   mode: "deep",
 *   estimatedInputTokens: 15000,
 *   requiresReasoning: true,
 *   requiresVision: false,
 *   latencyBudgetMs: 30000,
 *   preferredProvider: "anthropic", // optional
 * }
 */
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

/**
 * @Owl.Providers.Types.Streaming - Chunk-based response contracts
 *
 * StreamChunk types for real-time response rendering:
 * - "text": Partial text content
 * - "thinking": Reasoning/thinking tokens
 * - "tool_use": Tool invocation
 * - "stop": Stream completed
 */
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

/**
 * @Owl.Providers.Types.Error - Union of all provider error types
 *
 * Providers can fail in multiple ways. Error types enable precise handling.
 * - ProviderError: Generic provider failure
 * - ProviderStreamError: Streaming error
 * - ProviderTimeoutError: Request timeout
 * - ProviderAuthError: Authentication failure
 * - ProviderRateLimitError: Rate limit exceeded
 */
export type AnyProviderError =
  | ProviderError
  | ProviderStreamError
  | ProviderTimeoutError
  | ProviderAuthError
  | ProviderRateLimitError

/**
 * @Owl.Providers.Types.Service - The unified LLM adapter interface
 *
 * All providers implement this interface. The router calls these methods
 * without knowing which provider is underneath.
 */
export interface LLMProviderService {
  /** Provider identifier: "openai", "anthropic", etc. */
  readonly id: string
  /** All models this provider supports with their capabilities */
  readonly capabilities: readonly ProviderCapability[]

  /**
   * Synchronous inference (non-streaming)
   *
   * @param request - InferenceRequest with messages and model
   * @returns InferenceResponse with content and usage
   */
  readonly complete: (
    request: InferenceRequest,
  ) => Effect.Effect<InferenceResponse, AnyProviderError>

  /**
   * Streaming inference
   *
   * @param request - InferenceRequest with messages and model
   * @returns Stream of StreamChunk for real-time rendering
   */
  readonly stream: (
    request: InferenceRequest,
  ) => Stream.Stream<StreamChunk, AnyProviderError>

  /**
   * Estimate tokens for a text string (provider-specific encoding)
   *
   * @param text - Text to count
   * @param modelId - Model for encoding (may use different tokenizer)
   * @returns Estimated token count
   */
  readonly countTokens: (
    text: string,
    modelId: string,
  ) => Effect.Effect<number, ProviderError>

  /**
   * Health check: is the provider accessible?
   *
   * @returns true if provider is healthy, fails with ProviderError otherwise
   */
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
