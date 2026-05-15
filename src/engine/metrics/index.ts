/**
 * @Owl.Engine.Metrics - Session-scoped UsageMetrics accounting
 *
 * Records successful Inference usage inside the runtime. This is deterministic
 * process-local accounting for /status and TUI observability, not external
 * telemetry.
 */
import { Context, Effect, Layer, Ref } from "effect"
import { METRICS_CONSTANTS } from "../../core/constants/index.js"
import type { Mode, ProviderId } from "../../core/schema/index.js"

export interface InferenceMetric {
  readonly taskId: string
  readonly mode: Mode
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

const average = (values: readonly number[]): number =>
  values.length === 0
    ? 0
    : Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)

const sumMetric = (
  records: readonly InferenceMetric[],
  field:
    | "inputTokens"
    | "outputTokens"
    | "cacheReadTokens"
    | "cacheWriteTokens"
    | "estimatedCostUsd",
): number => records.reduce((sum, record) => sum + record[field], 0)

const normalizeMetric = (metric: RecordInferenceMetric): InferenceMetric => ({
  ...metric,
  cacheReadTokens: metric.cacheReadTokens ?? 0,
  cacheWriteTokens: metric.cacheWriteTokens ?? 0,
  estimatedCostUsd: metric.estimatedCostUsd ?? 0,
})

const calculateCacheHitRate = (
  inputTokens: number,
  cacheReadTokens: number,
): number => {
  const denominator = inputTokens + cacheReadTokens
  return denominator === 0 ? 0 : cacheReadTokens / denominator
}

const aggregateProviders = (
  records: readonly InferenceMetric[],
): readonly ProviderUsageMetrics[] =>
  Array.from(
    records.reduce<Map<ProviderId, readonly InferenceMetric[]>>(
      (map, record) => {
        const existing = map.get(record.provider) ?? []
        map.set(record.provider, [...existing, record])
        return map
      },
      new Map(),
    ),
  ).map(([provider, providerRecords]) => {
    const inputTokens = sumMetric(providerRecords, "inputTokens")
    const outputTokens = sumMetric(providerRecords, "outputTokens")
    const cacheReadTokens = sumMetric(providerRecords, "cacheReadTokens")
    const cacheWriteTokens = sumMetric(providerRecords, "cacheWriteTokens")
    const estimatedCostUsd = sumMetric(providerRecords, "estimatedCostUsd")
    return {
      provider,
      calls: providerRecords.length,
      inputTokens,
      outputTokens,
      cacheReadTokens,
      cacheWriteTokens,
      estimatedCostUsd,
      totalTokens: inputTokens + outputTokens,
      averageLatencyMs: average(providerRecords.map((r) => r.latencyMs)),
    }
  })

const aggregateModels = (
  records: readonly InferenceMetric[],
): readonly ModelUsageMetrics[] =>
  Array.from(
    records.reduce<
      Map<
        string,
        {
          readonly provider: ProviderId
          readonly model: string
          readonly records: readonly InferenceMetric[]
        }
      >
    >((map, record) => {
      const key = record.provider + ":" + record.model
      const existing = map.get(key)
      map.set(key, {
        provider: record.provider,
        model: record.model,
        records: [...(existing?.records ?? []), record],
      })
      return map
    }, new Map()),
  ).map(([, group]) => {
    const modelRecords = group.records
    const inputTokens = sumMetric(modelRecords, "inputTokens")
    const outputTokens = sumMetric(modelRecords, "outputTokens")
    const cacheReadTokens = sumMetric(modelRecords, "cacheReadTokens")
    const cacheWriteTokens = sumMetric(modelRecords, "cacheWriteTokens")
    const estimatedCostUsd = sumMetric(modelRecords, "estimatedCostUsd")
    return {
      model: group.model,
      provider: group.provider,
      calls: modelRecords.length,
      inputTokens,
      outputTokens,
      cacheReadTokens,
      cacheWriteTokens,
      estimatedCostUsd,
      totalTokens: inputTokens + outputTokens,
    }
  })

const toSnapshot = (
  records: readonly InferenceMetric[],
): UsageMetricsSnapshot => {
  const inputTokens = sumMetric(records, "inputTokens")
  const outputTokens = sumMetric(records, "outputTokens")
  const totalCacheReadTokens = sumMetric(records, "cacheReadTokens")
  const totalCacheWriteTokens = sumMetric(records, "cacheWriteTokens")
  const totalEstimatedCostUsd = sumMetric(records, "estimatedCostUsd")
  return {
    totalCalls: records.length,
    inputTokens,
    outputTokens,
    totalCacheReadTokens,
    totalCacheWriteTokens,
    totalEstimatedCostUsd,
    cacheHitRate: calculateCacheHitRate(inputTokens, totalCacheReadTokens),
    totalTokens: inputTokens + outputTokens,
    averageLatencyMs: average(records.map((r) => r.latencyMs)),
    byProvider: aggregateProviders(records),
    byModel: aggregateModels(records),
    recent: records.slice(-METRICS_CONSTANTS.RECENT_INFERENCE_LIMIT),
  }
}

/** @Owl.Engine.Metrics.Live - Ref-backed UsageMetrics state */
export const UsageMetricsLive = Layer.effect(
  UsageMetrics,
  Effect.gen(function* () {
    const recordsRef = yield* Ref.make<readonly InferenceMetric[]>([])

    const recordInference = (
      metric: RecordInferenceMetric,
    ): Effect.Effect<void> =>
      Ref.update(recordsRef, (records) => [...records, normalizeMetric(metric)])

    const snapshot = (): Effect.Effect<UsageMetricsSnapshot> =>
      Ref.get(recordsRef).pipe(Effect.map(toSnapshot))

    const reset = (): Effect.Effect<void> => Ref.set(recordsRef, [])

    return {
      recordInference,
      snapshot,
      reset,
    } satisfies UsageMetricsService
  }),
)
