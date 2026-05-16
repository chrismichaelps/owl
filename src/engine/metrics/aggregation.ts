/** @Owl.Engine.Metrics.Aggregation - UsageMetrics snapshot reducers */
import { Chunk, Data, HashMap, Option, Order } from "effect"
import { METRICS_CONSTANTS } from "../../core/constants/index.js"
import type {
  InferenceMetric,
  ModelUsageMetrics,
  ProviderUsageMetrics,
  RecordInferenceMetric,
  UsageMetricsSnapshot,
} from "./index.js"
import type { ProviderId } from "../../core/schema/index.js"

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

export const normalizeMetric = (
  metric: RecordInferenceMetric,
): InferenceMetric =>
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

/** @Owl.Engine.Metrics.Aggregation.Snapshot - Build deterministic snapshot */
export const toSnapshot = (
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
