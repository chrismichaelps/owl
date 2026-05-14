import { describe, it, expect, vi } from "vitest"
import { Effect, Layer } from "effect"
import {
  Orchestrator,
  OrchestratorLive,
} from "../../src/engine/orchestrator/index.js"
import { ContextManagerLive } from "../../src/engine/context/index.js"
import { SessionMemoryLive } from "../../src/engine/memory/index.js"
import {
  ProviderRouter,
  type ProviderRouterService,
} from "../../src/providers/router/index.js"
import type { RoutingContext } from "../../src/providers/types.js"
import type { Task } from "../../src/core/schema/index.js"
import { TokenBudgetLive } from "../../src/tokens/budget/index.js"

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: "task-001",
  prompt: "Write a hello world function",
  mode: "standard",
  createdAt: new Date().toISOString(),
  ...overrides,
})

const stubResponse = {
  taskId: "task-001",
  content: "Here is a hello world function: `console.log('Hello')`",
  stopReason: "end_turn" as const,
  usage: {
    inputTokens: 50,
    outputTokens: 30,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
  },
  model: "claude-opus-4",
  provider: "anthropic" as const,
  latencyMs: 120,
}

const stubStreamChunks = ["Hello ", "world"]
const completeSpy = vi.fn()

const TestProviderRouterLive = Layer.succeed(ProviderRouter, {
  route: (_ctx: RoutingContext) =>
    Effect.succeed({
      selectedProvider: "anthropic" as const,
      selectedModel: "claude-opus-4",
      score: 0.9,
      fallbackProviders: [],
      reasoning: "test stub",
      estimatedCostUsd: 0.001,
    }),
  complete: (
    _ctx: RoutingContext,
    req: Parameters<ProviderRouterService["complete"]>[1],
  ) =>
    Effect.sync(() => {
      completeSpy()
      return { ...stubResponse, taskId: req.taskId }
    }),
  completeWithCallback: (
    _ctx: RoutingContext,
    req: Parameters<ProviderRouterService["completeWithCallback"]>[1],
    onChunk: Parameters<ProviderRouterService["completeWithCallback"]>[2],
  ) =>
    Effect.sync(() => {
      stubStreamChunks.forEach(onChunk)
      return {
        content: stubStreamChunks.join(""),
        provider: "anthropic",
        model: "claude-opus-4",
        latencyMs: 100,
      }
    }),
  listProviders: () => Effect.succeed(["anthropic"]),
} satisfies ProviderRouterService)

const testLayer = OrchestratorLive.pipe(
  Layer.provide(ContextManagerLive),
  Layer.provide(SessionMemoryLive),
  Layer.provide(TokenBudgetLive),
  Layer.provide(TestProviderRouterLive),
)

const run = <A, E>(eff: Effect.Effect<A, E, Orchestrator>) =>
  Effect.runPromise(eff.pipe(Effect.provide(testLayer)) as Effect.Effect<A>)

describe("Orchestrator.run", () => {
  it("fails before provider execution when estimated input exceeds mode budget", async () => {
    completeSpy.mockClear()
    const exit = await Effect.runPromiseExit(
      Effect.gen(function* () {
        const orch = yield* Orchestrator
        return yield* orch.run(
          makeTask({ mode: "economy", prompt: "x".repeat(12_000) }),
        )
      }).pipe(Effect.provide(testLayer)),
    )

    expect(exit._tag).toBe("Failure")
    expect(completeSpy).not.toHaveBeenCalled()
  })

  it("returns an InferenceResponse for a valid task", async () => {
    const response = await run(
      Effect.gen(function* () {
        const orch = yield* Orchestrator
        return yield* orch.run(makeTask())
      }),
    )
    expect(response.content).toContain("hello world")
    expect(response.provider).toBe("anthropic")
    expect(response.stopReason).toBe("end_turn")
  })

  it("records the task id in the response", async () => {
    const response = await run(
      Effect.gen(function* () {
        const orch = yield* Orchestrator
        return yield* orch.run(makeTask({ id: "task-xyz" }))
      }),
    )
    expect(response.taskId).toBe("task-xyz")
  })

  it("runs two sequential tasks without error", async () => {
    const responses = await run(
      Effect.gen(function* () {
        const orch = yield* Orchestrator
        const r1 = yield* orch.run(makeTask({ id: "t1", prompt: "task one" }))
        const r2 = yield* orch.run(makeTask({ id: "t2", prompt: "task two" }))
        return [r1, r2] as const
      }),
    )
    expect(responses[0].taskId).toBe("t1")
    expect(responses[1].taskId).toBe("t2")
  })
})

describe("Orchestrator.getSessionSummary", () => {
  it("returns a summary after tasks are run", async () => {
    const summary = await run(
      Effect.gen(function* () {
        const orch = yield* Orchestrator
        yield* orch.run(makeTask({ id: "t1" }))
        yield* orch.run(makeTask({ id: "t2" }))
        return yield* orch.getSessionSummary()
      }),
    )
    expect(summary).toContain("2")
  })
})

describe("Orchestrator.runStream", () => {
  it("delivers chunks via callback and returns InferenceResponse", async () => {
    const received: string[] = []
    const response = await run(
      Effect.gen(function* () {
        const orch = yield* Orchestrator
        return yield* orch.runStream(makeTask(), (chunk) => {
          received.push(chunk)
        })
      }),
    )
    expect(received).toEqual(["Hello ", "world"])
    expect(response.content).toBe("Hello world")
    expect(response.provider).toBe("anthropic")
    expect(response.stopReason).toBe("end_turn")
  })

  it("records the turn in session memory after streaming", async () => {
    const response = await run(
      Effect.gen(function* () {
        const orch = yield* Orchestrator
        yield* orch.runStream(
          makeTask({ id: "stream-1", prompt: "stream task" }),
          vi.fn(),
        )
        return yield* orch.getSessionSummary()
      }),
    )
    expect(response).toContain("1")
  })
})
