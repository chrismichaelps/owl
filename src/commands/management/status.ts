/**
 * @Owl.Commands.Management.Status - Display session status: /status
 *
 * Shows current session statistics:
 * - Turn count
 * - Total tokens used
 * - Last turn timestamp
 * - Runtime UsageMetrics
 *
 * @example
 * /status
 * // Session turns: 5
 * // Total tokens used: 15420
 * // Last turn: 2024-01-15T10:35:00Z
 */
import { Chunk, Effect, Option } from "effect"
import {
  METRICS_CONSTANTS,
  TUI_ROUTING_COPY,
} from "../../core/constants/index.js"
import { formatEstimatedCostUsd } from "../../core/cost.js"
import type { CommandParseError } from "../../core/errors/index.js"
import type {
  InferenceMetric,
  ModelUsageMetrics,
  ProviderUsageMetrics,
} from "../../engine/metrics/index.js"
import type { UsageMetricsService } from "../../engine/metrics/index.js"
import type { SessionTurn } from "../../engine/memory/index.js"
import type { SessionMemoryService } from "../../engine/memory/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

const formatCacheHitRate = (hitRate: number): string =>
  (hitRate * METRICS_CONSTANTS.CACHE_HIT_RATE_PERCENT_MULTIPLIER).toFixed(
    METRICS_CONSTANTS.CACHE_HIT_RATE_DECIMAL_PLACES,
  )

const formatProviderUsage = (provider: ProviderUsageMetrics): string =>
  "Provider " +
  provider.provider +
  ": " +
  String(provider.calls) +
  " calls, " +
  String(provider.totalTokens) +
  " tokens, " +
  formatEstimatedCostUsd(provider.estimatedCostUsd) +
  ", " +
  String(provider.averageLatencyMs) +
  "ms avg"

const formatModelUsage = (model: ModelUsageMetrics): string =>
  "Model " +
  model.provider +
  "/" +
  model.model +
  ": " +
  String(model.calls) +
  " calls, " +
  String(model.totalTokens) +
  " tokens, " +
  formatEstimatedCostUsd(model.estimatedCostUsd)

const formatRecentInference = (metric: InferenceMetric): string =>
  "Recent " +
  metric.taskId +
  ": " +
  metric.provider +
  "/" +
  metric.model +
  ", " +
  String(metric.inputTokens + metric.outputTokens) +
  " tokens, " +
  TUI_ROUTING_COPY.LABEL.toLowerCase() +
  ":" +
  metric.mode +
  (metric.mode === metric.routingMode
    ? ""
    : TUI_ROUTING_COPY.MODE_SEPARATOR + metric.routingMode) +
  ", " +
  String(metric.latencyMs) +
  "ms"

const formatLastTurn = (turns: Chunk.Chunk<SessionTurn>): string =>
  Option.match(Chunk.last(turns), {
    onNone: () => "",
    onSome: (turn) => "\nLast turn: " + turn.timestamp,
  })

const formatOptionalSection = (
  title: string,
  lines: Chunk.Chunk<string>,
): string =>
  Chunk.isEmpty(lines)
    ? ""
    : "\n" + title + ":\n" + Chunk.toReadonlyArray(lines).join("\n")

/**
 * @Owl.Commands.Management.Status.Factory - Create the /status command handler
 */
export function makeStatusCommand(
  sessionMemory: SessionMemoryService,
  usageMetrics: UsageMetricsService,
): CommandHandler {
  return {
    name: "status",
    description: "Display current session status and turn count: /status",
    execute: (_args): Effect.Effect<CommandResult, CommandParseError> =>
      Effect.gen(function* () {
        const turns = yield* sessionMemory.getTurns()
        const metrics = yield* usageMetrics.snapshot()
        const turnChunk = Chunk.fromIterable(turns)
        const providerLines = Chunk.map(
          Chunk.fromIterable(metrics.byProvider),
          formatProviderUsage,
        )
        const modelLines = Chunk.map(
          Chunk.take(
            Chunk.fromIterable(metrics.byModel),
            METRICS_CONSTANTS.STATUS_MODEL_LIMIT,
          ),
          formatModelUsage,
        )
        const recentLines = Chunk.map(
          Chunk.takeRight(
            Chunk.fromIterable(metrics.recent),
            METRICS_CONSTANTS.STATUS_RECENT_LIMIT,
          ),
          formatRecentInference,
        )
        const hasCacheMetrics =
          metrics.totalCacheReadTokens + metrics.totalCacheWriteTokens > 0
        const cacheLine = hasCacheMetrics
          ? "\nCache: " +
            formatCacheHitRate(metrics.cacheHitRate) +
            "% hit rate | " +
            String(metrics.totalCacheReadTokens) +
            " tokens saved from cache"
          : ""

        const totalTokens = Chunk.reduce(
          turnChunk,
          0,
          (sum, turn) => sum + turn.tokensUsed,
        )
        const output =
          "Session turns: " +
          String(Chunk.size(turnChunk)) +
          "\nTotal tokens used: " +
          String(totalTokens) +
          "\nInference calls: " +
          String(metrics.totalCalls) +
          "\nInput tokens: " +
          String(metrics.inputTokens) +
          "\nOutput tokens: " +
          String(metrics.outputTokens) +
          "\nInference tokens: " +
          String(metrics.totalTokens) +
          "\nEstimated cost: " +
          formatEstimatedCostUsd(metrics.totalEstimatedCostUsd) +
          "\nAverage latency: " +
          String(metrics.averageLatencyMs) +
          "ms" +
          cacheLine +
          formatOptionalSection("Providers", providerLines) +
          formatOptionalSection("Models", modelLines) +
          formatOptionalSection("Recent inference", recentLines) +
          formatLastTurn(turnChunk)
        return { output }
      }),
  }
}
