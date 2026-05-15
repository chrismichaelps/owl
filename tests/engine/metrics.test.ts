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
