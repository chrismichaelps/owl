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
import { Effect } from "effect"
import { METRICS_CONSTANTS } from "../../core/constants/index.js"
import type { CommandParseError } from "../../core/errors/index.js"
import type { UsageMetricsService } from "../../engine/metrics/index.js"
import type { SessionMemoryService } from "../../engine/memory/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

const formatCacheHitRate = (hitRate: number): string =>
  (hitRate * METRICS_CONSTANTS.CACHE_HIT_RATE_PERCENT_MULTIPLIER).toFixed(
    METRICS_CONSTANTS.CACHE_HIT_RATE_DECIMAL_PLACES,
  )

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
        const providerLines = metrics.byProvider.map(
          (provider) =>
            "\nProvider " +
            provider.provider +
            ": " +
            String(provider.calls) +
            " calls, " +
            String(provider.totalTokens) +
            " tokens, " +
            String(provider.averageLatencyMs) +
            "ms avg",
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

        const totalTokens = turns.reduce((sum, t) => sum + t.tokensUsed, 0)
        const output =
          "Session turns: " +
          String(turns.length) +
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
          "\nAverage latency: " +
          String(metrics.averageLatencyMs) +
          "ms" +
          cacheLine +
          providerLines.join("") +
          (turns.length > 0
            ? "\nLast turn: " + (turns[turns.length - 1]?.timestamp ?? "")
            : "")
        return { output }
      }),
  }
}
