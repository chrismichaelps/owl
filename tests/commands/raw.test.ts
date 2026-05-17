/** @Owl.Tests.Commands.Raw - Raw command routing regressions */
import { describe, expect, it } from "vitest"
import { Effect } from "effect"
import { makeRawCommand } from "../../src/commands/power/raw.js"
import type { InferenceResponse, Task } from "../../src/core/schema/index.js"
import type { OrchestratorService } from "../../src/engine/orchestrator/index.js"

const RESPONSE: InferenceResponse = {
  taskId: "raw-1",
  content: "raw output",
  stopReason: "end_turn",
  usage: {
    inputTokens: 1,
    outputTokens: 1,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    estimatedCostUsd: 0,
  },
  model: "test-model",
  provider: "anthropic",
  latencyMs: 1,
}

const makeOrchestrator = (
  capture: (task: Task) => void,
): OrchestratorService => ({
  run: (task) =>
    Effect.sync(() => {
      capture(task)
      return { ...RESPONSE, taskId: task.id }
    }),
  runParallel: () => Effect.die("runParallel not used in raw command"),
  runStream: () => Effect.die("runStream not used in raw command"),
  getSessionSummary: () =>
    Effect.die("getSessionSummary not used in raw command"),
})

describe("makeRawCommand", () => {
  it("disables adaptive routing for raw prompts", async () => {
    let capturedTask: Task | undefined
    const command = makeRawCommand(
      makeOrchestrator((task) => {
        capturedTask = task
      }),
    )

    const result = await Effect.runPromise(
      command.execute(["Investigate", "provider", "architecture"]),
    )

    expect(result.output).toBe("raw output")
    expect(capturedTask?.mode).toBe("standard")
    expect(capturedTask?.adaptiveRouting).toBe(false)
  })
})
