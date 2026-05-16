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
import { Context } from "effect"
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
import type { ProviderCapability, StreamChunk } from "./schema.js"

export type {
  ProviderCapability,
  StreamChunk,
  RoutingContext,
  RoutingDecision,
} from "./schema.js"

export {
  ProviderCapabilitySchema,
  StreamChunkSchema,
  RoutingContextSchema,
  RoutingDecisionSchema,
} from "./schema.js"

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

/**
 * @Owl.Providers.Types.StreamingResult - Result of a streaming Inference
 *
 * Returned by ProviderRouter.completeWithCallback after the stream completes.
 * Token counts are included when a provider reports final stream usage.
 * The Orchestrator falls back to deterministic estimates if they are zero.
 */
export interface StreamingCallbackResult {
  /** Full assembled response content (all chunks joined) */
  readonly content: string
  /** Provider that handled the Inference */
  readonly provider: string
  /** Model used for the Inference */
  readonly model: string
  /** End-to-end latency in milliseconds (start of route() to stream end) */
  readonly latencyMs: number
  /** Input tokens reported by provider usage (0 if not reported) */
  readonly inputTokens: number
  /** Output tokens reported by provider usage (0 if not reported) */
  readonly outputTokens: number
  /** Cache read tokens from provider usage (0 if not reported) */
  readonly cacheReadTokens: number
  /** Cache write tokens from provider usage (0 if not reported) */
  readonly cacheWriteTokens: number
  /** Estimated USD cost for this streaming Inference */
  readonly estimatedCostUsd: number
}
