/**
 * @Owl.Engine.Metrics - Session-scoped UsageMetrics accounting
 *
 * Records successful Inference usage inside the runtime. This is deterministic
 * process-local accounting for /status and TUI observability, not external
 * telemetry.
 */
import {
  Chunk,
  Context,
  Data,
  Effect,
  HashMap,
  Layer,
  Option,
  Order,
  Ref,
} from "effect"
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

const average = (values: Chunk.Chunk<number>): number =>
  Chunk.isEmpty(values)
    ? 0
    : Math.round(
        Chunk.reduce(values, 0, (sum, value) => sum + value) /
          Chunk.size(values),
      )

const sumMetric = (
  records: Chunk.Chunk<InferenceMetric>,
  field:
    | "inputTokens"
    | "outputTokens"
    | "cacheReadTokens"
    | "cacheWriteTokens"
    | "estimatedCostUsd",
): number => Chunk.reduce(records, 0, (sum, record) => sum + record[field])

const normalizeMetric = (metric: RecordInferenceMetric): InferenceMetric =>
  Data.struct({
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

const groupByProvider = (
  records: Chunk.Chunk<InferenceMetric>,
): HashMap.HashMap<ProviderId, Chunk.Chunk<InferenceMetric>> =>
  Chunk.reduce(
    records,
    HashMap.empty<ProviderId, Chunk.Chunk<InferenceMetric>>(),
    (groups, record) => {
      const existing = Option.getOrElse(
        HashMap.get(groups, record.provider),
        () => Chunk.empty<InferenceMetric>(),
      )
      return HashMap.set(
        groups,
        record.provider,
        Chunk.append(existing, record),
      )
    },
  )

type ModelGroup = Readonly<{
  readonly provider: ProviderId
  readonly model: string
  readonly records: Chunk.Chunk<InferenceMetric>
}>

const providerUsageOrder = Order.mapInput(
  Order.string,
  (usage: ProviderUsageMetrics) => usage.provider,
)

const modelUsageOrder = Order.make<ModelUsageMetrics>((left, right) => {
  const providerComparison = Order.string(left.provider, right.provider)
  return providerComparison === 0
    ? Order.string(left.model, right.model)
    : providerComparison
})

const groupByModel = (
  records: Chunk.Chunk<InferenceMetric>,
): HashMap.HashMap<string, ModelGroup> =>
  Chunk.reduce(
    records,
    HashMap.empty<string, ModelGroup>(),
    (groups, record) => {
      const key = record.provider + ":" + record.model
      const existing = Option.getOrUndefined(HashMap.get(groups, key))
      const modelRecords = existing?.records ?? Chunk.empty<InferenceMetric>()
      return HashMap.set(
        groups,
        key,
        Data.struct({
          provider: record.provider,
          model: record.model,
          records: Chunk.append(modelRecords, record),
        }),
      )
    },
  )

const aggregateProviders = (
  records: Chunk.Chunk<InferenceMetric>,
): readonly ProviderUsageMetrics[] =>
  Chunk.toReadonlyArray(
    Chunk.sort(
      Chunk.map(
        Chunk.fromIterable(HashMap.entries(groupByProvider(records))),
        ([provider, providerRecords]) => {
          const inputTokens = sumMetric(providerRecords, "inputTokens")
          const outputTokens = sumMetric(providerRecords, "outputTokens")
          const cacheReadTokens = sumMetric(providerRecords, "cacheReadTokens")
          const cacheWriteTokens = sumMetric(
            providerRecords,
            "cacheWriteTokens",
          )
          const estimatedCostUsd = sumMetric(
            providerRecords,
            "estimatedCostUsd",
          )
          return Data.struct({
            provider,
            calls: Chunk.size(providerRecords),
            inputTokens,
            outputTokens,
            cacheReadTokens,
            cacheWriteTokens,
            estimatedCostUsd,
            totalTokens: inputTokens + outputTokens,
            averageLatencyMs: average(
              Chunk.map(providerRecords, (record) => record.latencyMs),
            ),
          })
        },
      ),
      providerUsageOrder,
    ),
  )

const aggregateModels = (
  records: Chunk.Chunk<InferenceMetric>,
): readonly ModelUsageMetrics[] =>
  Chunk.toReadonlyArray(
    Chunk.sort(
      Chunk.map(
        Chunk.fromIterable(HashMap.values(groupByModel(records))),
        (group) => {
          const modelRecords = group.records
          const inputTokens = sumMetric(modelRecords, "inputTokens")
          const outputTokens = sumMetric(modelRecords, "outputTokens")
          const cacheReadTokens = sumMetric(modelRecords, "cacheReadTokens")
          const cacheWriteTokens = sumMetric(modelRecords, "cacheWriteTokens")
          const estimatedCostUsd = sumMetric(modelRecords, "estimatedCostUsd")
          return Data.struct({
            model: group.model,
            provider: group.provider,
            calls: Chunk.size(modelRecords),
            inputTokens,
            outputTokens,
            cacheReadTokens,
            cacheWriteTokens,
            estimatedCostUsd,
            totalTokens: inputTokens + outputTokens,
          })
        },
      ),
      modelUsageOrder,
    ),
  )

const toSnapshot = (
  records: Chunk.Chunk<InferenceMetric>,
): UsageMetricsSnapshot => {
  const inputTokens = sumMetric(records, "inputTokens")
  const outputTokens = sumMetric(records, "outputTokens")
  const totalCacheReadTokens = sumMetric(records, "cacheReadTokens")
  const totalCacheWriteTokens = sumMetric(records, "cacheWriteTokens")
  const totalEstimatedCostUsd = sumMetric(records, "estimatedCostUsd")
  return Data.struct({
    totalCalls: Chunk.size(records),
    inputTokens,
    outputTokens,
    totalCacheReadTokens,
    totalCacheWriteTokens,
    totalEstimatedCostUsd,
    cacheHitRate: calculateCacheHitRate(inputTokens, totalCacheReadTokens),
    totalTokens: inputTokens + outputTokens,
    averageLatencyMs: average(Chunk.map(records, (record) => record.latencyMs)),
    byProvider: aggregateProviders(records),
    byModel: aggregateModels(records),
    recent: Chunk.toReadonlyArray(
      Chunk.takeRight(records, METRICS_CONSTANTS.RECENT_INFERENCE_LIMIT),
    ),
  })
}

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
