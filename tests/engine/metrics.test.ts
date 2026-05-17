/** @Owl.Tests.Engine.Metrics - UsageMetrics service tests */
import { describe, expect, it } from "vitest"
import { Effect } from "effect"
import {
  UsageMetrics,
  UsageMetricsLive,
} from "../../src/engine/metrics/index.js"

const run = <A>(effect: Effect.Effect<A, never, UsageMetrics>) =>
  Effect.runPromise(effect.pipe(Effect.provide(UsageMetricsLive)))

describe("UsageMetrics", () => {
  it("starts with empty totals", async () => {
    const snapshot = await run(
      Effect.gen(function* () {
        const metrics = yield* UsageMetrics
        return yield* metrics.snapshot()
      }),
    )

    expect(snapshot.totalCalls).toBe(0)
    expect(snapshot.totalTokens).toBe(0)
    expect(snapshot.byProvider).toEqual([])
  })

  it("records and aggregates Inference usage", async () => {
    const snapshot = await run(
      Effect.gen(function* () {
        const metrics = yield* UsageMetrics
        yield* metrics.recordInference({
          taskId: "task-1",
          mode: "standard",
          provider: "anthropic",
          model: "claude-sonnet-4",
          inputTokens: 100,
          outputTokens: 50,
          latencyMs: 120,
          timestamp: "2026-05-14T21:20:00.000Z",
        })
        yield* metrics.recordInference({
          taskId: "task-2",
          mode: "deep",
          provider: "anthropic",
          model: "claude-sonnet-4",
          inputTokens: 200,
          outputTokens: 100,
          latencyMs: 180,
          timestamp: "2026-05-14T21:21:00.000Z",
        })
        return yield* metrics.snapshot()
      }),
    )

    expect(snapshot.totalCalls).toBe(2)
    expect(snapshot.inputTokens).toBe(300)
    expect(snapshot.outputTokens).toBe(150)
    expect(snapshot.totalCacheReadTokens).toBe(0)
    expect(snapshot.totalCacheWriteTokens).toBe(0)
    expect(snapshot.totalEstimatedCostUsd).toBe(0)
    expect(snapshot.cacheHitRate).toBe(0)
    expect(snapshot.totalTokens).toBe(450)
    expect(snapshot.averageLatencyMs).toBe(150)
    expect(snapshot.byProvider[0]?.calls).toBe(2)
    expect(snapshot.byModel[0]?.totalTokens).toBe(450)
  })

  it("records prompt cache read and write efficiency", async () => {
    const snapshot = await run(
      Effect.gen(function* () {
        const metrics = yield* UsageMetrics
        yield* metrics.recordInference({
          taskId: "task-cache-1",
          mode: "standard",
          provider: "anthropic",
          model: "claude-sonnet-4",
          inputTokens: 100,
          outputTokens: 50,
          cacheReadTokens: 800,
          cacheWriteTokens: 150,
          latencyMs: 100,
          timestamp: "2026-05-14T21:23:00.000Z",
        })
        yield* metrics.recordInference({
          taskId: "task-cache-2",
          mode: "standard",
          provider: "anthropic",
          model: "claude-sonnet-4",
          inputTokens: 100,
          outputTokens: 50,
          cacheReadTokens: 800,
          latencyMs: 90,
          timestamp: "2026-05-14T21:24:00.000Z",
        })
        return yield* metrics.snapshot()
      }),
    )

    expect(snapshot.totalCacheReadTokens).toBe(1_600)
    expect(snapshot.totalCacheWriteTokens).toBe(150)
    expect(snapshot.cacheHitRate).toBeCloseTo(1_600 / 1_800)
    expect(snapshot.byProvider[0]?.cacheReadTokens).toBe(1_600)
    expect(snapshot.byProvider[0]?.cacheWriteTokens).toBe(150)
    expect(snapshot.byModel[0]?.cacheReadTokens).toBe(1_600)
  })

  it("records effective routing mode for adaptive inference", async () => {
    const snapshot = await run(
      Effect.gen(function* () {
        const metrics = yield* UsageMetrics
        yield* metrics.recordInference({
          taskId: "task-route-1",
          mode: "standard",
          routingMode: "deep",
          provider: "anthropic",
          model: "claude-sonnet-4",
          inputTokens: 100,
          outputTokens: 50,
          latencyMs: 100,
          timestamp: "2026-05-14T21:24:30.000Z",
        })
        return yield* metrics.snapshot()
      }),
    )

    expect(snapshot.recent[0]?.mode).toBe("standard")
    expect(snapshot.recent[0]?.routingMode).toBe("deep")
  })

  it("defaults routing mode to submitted mode", async () => {
    const snapshot = await run(
      Effect.gen(function* () {
        const metrics = yield* UsageMetrics
        yield* metrics.recordInference({
          taskId: "task-route-2",
          mode: "quick",
          provider: "ollama",
          model: "llama3.1",
          inputTokens: 10,
          outputTokens: 5,
          latencyMs: 40,
          timestamp: "2026-05-14T21:24:45.000Z",
        })
        return yield* metrics.snapshot()
      }),
    )

    expect(snapshot.recent[0]?.routingMode).toBe("quick")
  })

  it("records and aggregates estimated USD cost", async () => {
    const snapshot = await run(
      Effect.gen(function* () {
        const metrics = yield* UsageMetrics
        yield* metrics.recordInference({
          taskId: "task-cost-1",
          mode: "standard",
          provider: "anthropic",
          model: "claude-sonnet-4",
          inputTokens: 100,
          outputTokens: 50,
          estimatedCostUsd: 0.001,
          latencyMs: 100,
          timestamp: "2026-05-14T21:25:00.000Z",
        })
        yield* metrics.recordInference({
          taskId: "task-cost-2",
          mode: "standard",
          provider: "anthropic",
          model: "claude-sonnet-4",
          inputTokens: 100,
          outputTokens: 50,
          estimatedCostUsd: 0.002,
          latencyMs: 100,
          timestamp: "2026-05-14T21:26:00.000Z",
        })
        return yield* metrics.snapshot()
      }),
    )

    expect(snapshot.totalEstimatedCostUsd).toBeCloseTo(0.003)
    expect(snapshot.byProvider[0]?.estimatedCostUsd).toBeCloseTo(0.003)
    expect(snapshot.byModel[0]?.estimatedCostUsd).toBeCloseTo(0.003)
  })

  it("sorts provider usage summaries deterministically", async () => {
    const snapshot = await run(
      Effect.gen(function* () {
        const metrics = yield* UsageMetrics
        yield* metrics.recordInference({
          taskId: "task-provider-1",
          mode: "standard",
          provider: "xai",
          model: "grok-4",
          inputTokens: 10,
          outputTokens: 5,
          latencyMs: 30,
          timestamp: "2026-05-14T21:27:00.000Z",
        })
        yield* metrics.recordInference({
          taskId: "task-provider-2",
          mode: "standard",
          provider: "anthropic",
          model: "claude-sonnet-4",
          inputTokens: 10,
          outputTokens: 5,
          latencyMs: 20,
          timestamp: "2026-05-14T21:28:00.000Z",
        })
        yield* metrics.recordInference({
          taskId: "task-provider-3",
          mode: "standard",
          provider: "ollama",
          model: "llama3.1",
          inputTokens: 10,
          outputTokens: 5,
          latencyMs: 10,
          timestamp: "2026-05-14T21:29:00.000Z",
        })
        return yield* metrics.snapshot()
      }),
    )

    expect(snapshot.byProvider.map((metric) => metric.provider)).toEqual([
      "anthropic",
      "ollama",
      "xai",
    ])
  })

  it("sorts model usage summaries by provider and model", async () => {
    const snapshot = await run(
      Effect.gen(function* () {
        const metrics = yield* UsageMetrics
        yield* metrics.recordInference({
          taskId: "task-model-1",
          mode: "standard",
          provider: "openai",
          model: "gpt-5.4",
          inputTokens: 10,
          outputTokens: 5,
          latencyMs: 30,
          timestamp: "2026-05-14T21:30:00.000Z",
        })
        yield* metrics.recordInference({
          taskId: "task-model-2",
          mode: "standard",
          provider: "anthropic",
          model: "claude-opus-4",
          inputTokens: 10,
          outputTokens: 5,
          latencyMs: 20,
          timestamp: "2026-05-14T21:31:00.000Z",
        })
        yield* metrics.recordInference({
          taskId: "task-model-3",
          mode: "standard",
          provider: "anthropic",
          model: "claude-sonnet-4",
          inputTokens: 10,
          outputTokens: 5,
          latencyMs: 10,
          timestamp: "2026-05-14T21:32:00.000Z",
        })
        return yield* metrics.snapshot()
      }),
    )

    expect(
      snapshot.byModel.map((metric) => metric.provider + "/" + metric.model),
    ).toEqual([
      "anthropic/claude-opus-4",
      "anthropic/claude-sonnet-4",
      "openai/gpt-5.4",
    ])
  })

  it("resets metrics", async () => {
    const snapshot = await run(
      Effect.gen(function* () {
        const metrics = yield* UsageMetrics
        yield* metrics.recordInference({
          taskId: "task-1",
          mode: "quick",
          provider: "ollama",
          model: "llama3.1",
          inputTokens: 10,
          outputTokens: 5,
          latencyMs: 20,
          timestamp: "2026-05-14T21:22:00.000Z",
        })
        yield* metrics.reset()
        return yield* metrics.snapshot()
      }),
    )

    expect(snapshot.totalCalls).toBe(0)
    expect(snapshot.recent).toEqual([])
  })
})
