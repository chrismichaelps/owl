/** @Owl.Tests.Commands.Compare - Parallel inference command tests */
import { describe, expect, it } from "vitest"
import { Effect } from "effect"
import {
  formatCompareOutput,
  makeCompareCommand,
} from "../../src/commands/power/compare.js"
import type { InferenceResponse } from "../../src/core/schema/index.js"
import type { OrchestratorService } from "../../src/engine/orchestrator/index.js"

const makeResponse = (
  provider: InferenceResponse["provider"],
  model: string,
  content: string,
): InferenceResponse => ({
  taskId: "compare-1",
  content,
  stopReason: "end_turn",
  usage: {
    inputTokens: 10,
    outputTokens: 5,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    estimatedCostUsd: 0.001,
  },
  model,
  provider,
  latencyMs: 100,
})

const makeOrchestrator = (): OrchestratorService => ({
  run: () => Effect.die("run not used in compare command"),
  runParallel: () =>
    Effect.succeed([
      makeResponse("anthropic", "claude-opus-4", "Anthropic answer"),
      makeResponse("openai", "gpt-5", "OpenAI answer"),
    ]),
  runStream: () => Effect.die("runStream not used in compare command"),
  getSessionSummary: () =>
    Effect.die("getSessionSummary not used in compare command"),
})

describe("formatCompareOutput", () => {
  it("renders provider/model sections in response order", () => {
    const output = formatCompareOutput([
      makeResponse("anthropic", "claude-opus-4", "A"),
      makeResponse("openai", "gpt-5", "B"),
    ])

    expect(output).toContain("## anthropic/claude-opus-4")
    expect(output).toContain("## openai/gpt-5")
    expect(output.indexOf("anthropic")).toBeLessThan(output.indexOf("openai"))
  })
})

describe("makeCompareCommand", () => {
  it("runs parallel inference and returns formatted output", async () => {
    const command = makeCompareCommand(makeOrchestrator())
    const result = await Effect.runPromise(command.execute(["hello"]))

    expect(result.output).toContain("Anthropic answer")
    expect(result.output).toContain("OpenAI answer")
  })
})
