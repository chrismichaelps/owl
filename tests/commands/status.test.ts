/** @Owl.Tests.Commands.Status - Session and UsageMetrics status tests */
import { describe, expect, it } from "vitest"
import { Effect } from "effect"
import { makeStatusCommand } from "../../src/commands/management/status.js"
import {
  UsageMetrics,
  UsageMetricsLive,
} from "../../src/engine/metrics/index.js"
import {
  SessionMemory,
  SessionMemoryLive,
} from "../../src/engine/memory/index.js"

const run = <A>(
  effect: Effect.Effect<A, never, UsageMetrics | SessionMemory>,
) =>
  Effect.runPromise(
    effect.pipe(
      Effect.provide(UsageMetricsLive),
      Effect.provide(SessionMemoryLive),
    ),
  )

describe("makeStatusCommand", () => {
  it("reports zero UsageMetrics when no Inference ran", async () => {
    const output = await run(
      Effect.gen(function* () {
        const memory = yield* SessionMemory
        const metrics = yield* UsageMetrics
        const command = makeStatusCommand(memory, metrics)
        const result = yield* command.execute([])
        return result.output
      }),
    )

    expect(output).toContain("Session turns: 0")
    expect(output).toContain("Inference calls: 0")
    expect(output).toContain("Average latency: 0ms")
  })

  it("reports Session and Provider UsageMetrics", async () => {
    const output = await run(
      Effect.gen(function* () {
        const memory = yield* SessionMemory
        const metrics = yield* UsageMetrics
        yield* memory.recordTurn({
          taskId: "task-1",
          prompt: "hello",
          response: "world",
          tokensUsed: 150,
          timestamp: "2026-05-14T21:24:00.000Z",
        })
        yield* metrics.recordInference({
          taskId: "task-1",
          mode: "standard",
          provider: "anthropic",
          model: "claude-sonnet-4",
          inputTokens: 100,
          outputTokens: 50,
          latencyMs: 120,
          timestamp: "2026-05-14T21:24:00.000Z",
        })
        const command = makeStatusCommand(memory, metrics)
        const result = yield* command.execute([])
        return result.output
      }),
    )

    expect(output).toContain("Session turns: 1")
    expect(output).toContain("Total tokens used: 150")
    expect(output).toContain("Inference calls: 1")
    expect(output).toContain("Provider anthropic: 1 calls, 150 tokens, 120ms avg")
  })
})
