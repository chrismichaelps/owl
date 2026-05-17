/**
 * @Owl.Engine.Metrics - Session-scoped UsageMetrics accounting
 *
 * Records successful Inference usage inside the runtime. This is deterministic
 * process-local accounting for /status and TUI observability, not external
 * telemetry.
 */
import { Chunk, Context, Effect, Layer, Ref } from "effect"
import { normalizeMetric, toSnapshot } from "./aggregation.js"
import type { Mode, ProviderId } from "../../core/schema/index.js"

export interface InferenceMetric {
  readonly taskId: string
  readonly mode: Mode
  readonly routingMode: Mode
  readonly provider: ProviderId
  readonly model: string
  readonly inputTokens: number
  readonly outputTokens: number
  readonly cacheReadTokens: number
  readonly cacheWriteTokens: number
  readonly estimatedCostUsd: number
  readonly latencyMs: number
  readonly timestamp: string
}

export interface RecordInferenceMetric {
  readonly taskId: string
  readonly mode: Mode
  readonly routingMode?: Mode
  readonly provider: ProviderId
  readonly model: string
  readonly inputTokens: number
  readonly outputTokens: number
  readonly cacheReadTokens?: number
  readonly cacheWriteTokens?: number
  readonly estimatedCostUsd?: number
  readonly latencyMs: number
  readonly timestamp: string
}

export interface ProviderUsageMetrics {
  readonly provider: ProviderId
  readonly calls: number
  readonly inputTokens: number
  readonly outputTokens: number
  readonly cacheReadTokens: number
  readonly cacheWriteTokens: number
  readonly estimatedCostUsd: number
  readonly totalTokens: number
  readonly averageLatencyMs: number
}

export interface ModelUsageMetrics {
  readonly model: string
  readonly provider: ProviderId
  readonly calls: number
  readonly inputTokens: number
  readonly outputTokens: number
  readonly cacheReadTokens: number
  readonly cacheWriteTokens: number
  readonly estimatedCostUsd: number
  readonly totalTokens: number
}

export interface UsageMetricsSnapshot {
  readonly totalCalls: number
  readonly inputTokens: number
  readonly outputTokens: number
  readonly totalCacheReadTokens: number
  readonly totalCacheWriteTokens: number
  readonly totalEstimatedCostUsd: number
  readonly cacheHitRate: number
  readonly totalTokens: number
  readonly averageLatencyMs: number
  readonly byProvider: readonly ProviderUsageMetrics[]
  readonly byModel: readonly ModelUsageMetrics[]
  readonly recent: readonly InferenceMetric[]
}

/** @Owl.Engine.Metrics.Service - UsageMetrics recording Interface */
export interface UsageMetricsService {
  readonly recordInference: (
    metric: RecordInferenceMetric,
  ) => Effect.Effect<void>
  readonly snapshot: () => Effect.Effect<UsageMetricsSnapshot>
  readonly reset: () => Effect.Effect<void>
}

/** @Owl.Engine.Metrics.Tag - UsageMetrics service tag */
export class UsageMetrics extends Context.Tag("UsageMetrics")<
  UsageMetrics,
  UsageMetricsService
>() {}

/** @Owl.Engine.Metrics.Live - Ref-backed UsageMetrics state */
export const UsageMetricsLive = Layer.effect(
  UsageMetrics,
  Effect.gen(function* () {
    const recordsRef = yield* Ref.make<Chunk.Chunk<InferenceMetric>>(
      Chunk.empty(),
    )

    const recordInference = (
      metric: RecordInferenceMetric,
    ): Effect.Effect<void> =>
      Ref.update(recordsRef, (records) =>
        Chunk.append(records, normalizeMetric(metric)),
      )

    const snapshot = (): Effect.Effect<UsageMetricsSnapshot> =>
      Ref.get(recordsRef).pipe(Effect.map(toSnapshot))

    const reset = (): Effect.Effect<void> => Ref.set(recordsRef, Chunk.empty())

    return {
      recordInference,
      snapshot,
      reset,
    } satisfies UsageMetricsService
  }),
)
