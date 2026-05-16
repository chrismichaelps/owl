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
import type { ProviderId, Task } from "../../src/core/schema/index.js"
import { TokenBudgetLive } from "../../src/tokens/budget/index.js"
import { RoutingPreferences } from "../../src/providers/preferences/index.js"
import {
  UsageMetrics,
  type RecordInferenceMetric,
} from "../../src/engine/metrics/index.js"

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
    estimatedCostUsd: 0.001,
  },
  model: "claude-opus-4",
  provider: "anthropic" as const,
  latencyMs: 120,
}

const stubStreamChunks = ["Hello ", "world"]
const completeSpy = vi.fn()
const observedRoutingContexts: RoutingContext[] = []
const observedInferenceMetrics: RecordInferenceMetric[] = []
let testPreferredProvider: ProviderId | undefined
let testPrivacyMode = false

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
    ctx: RoutingContext,
    req: Parameters<ProviderRouterService["complete"]>[1],
  ) =>
    Effect.sync(() => {
      observedRoutingContexts.push(ctx)
      completeSpy()
      return { ...stubResponse, taskId: req.taskId }
    }),
  completeParallel: () =>
    Effect.die("completeParallel not used in orchestrator tests"),
  completeWithCallback: (
    ctx: RoutingContext,
    req: Parameters<ProviderRouterService["completeWithCallback"]>[1],
    onChunk: Parameters<ProviderRouterService["completeWithCallback"]>[2],
  ) =>
    Effect.sync(() => {
      observedRoutingContexts.push(ctx)
      stubStreamChunks.forEach(onChunk)
      return {
        content: stubStreamChunks.join(""),
        provider: "anthropic",
        model: "claude-opus-4",
        latencyMs: 100,
        inputTokens: 250,
        outputTokens: 30,
        cacheReadTokens: 300,
        cacheWriteTokens: 50,
        estimatedCostUsd: 0.002,
      }
    }),
  listProviders: () => Effect.succeed(["anthropic"]),
} satisfies ProviderRouterService)

const TestRoutingPreferencesLive = Layer.succeed(RoutingPreferences, {
  setPreferredProvider: (provider: ProviderId) =>
    Effect.sync(() => {
      testPreferredProvider = provider
    }),
  clearPreferredProvider: () =>
    Effect.sync(() => {
      testPreferredProvider = undefined
    }),
  getPreferredProvider: () => Effect.succeed(testPreferredProvider),
  setPrivacyMode: (enabled: boolean) =>
    Effect.sync(() => {
      testPrivacyMode = enabled
    }),
  getPrivacyMode: () => Effect.succeed(testPrivacyMode),
  snapshot: () =>
    Effect.succeed({
      ...(testPreferredProvider !== undefined
        ? { preferredProvider: testPreferredProvider }
        : {}),
      privacyMode: testPrivacyMode,
    }),
})

const TestUsageMetricsLive = Layer.succeed(UsageMetrics, {
  recordInference: (metric: RecordInferenceMetric) =>
    Effect.sync(() => {
      observedInferenceMetrics.push(metric)
    }),
  snapshot: () =>
    Effect.succeed({
      totalCalls: observedInferenceMetrics.length,
      inputTokens: 0,
      outputTokens: 0,
      totalCacheReadTokens: 0,
      totalCacheWriteTokens: 0,
      totalEstimatedCostUsd: 0,
      cacheHitRate: 0,
      totalTokens: 0,
      averageLatencyMs: 0,
      byProvider: [],
      byModel: [],
      recent: observedInferenceMetrics,
    }),
  reset: () =>
    Effect.sync(() => {
      observedInferenceMetrics.length = 0
    }),
})

const testLayer = OrchestratorLive.pipe(
  Layer.provide(ContextManagerLive),
  Layer.provide(SessionMemoryLive),
  Layer.provide(TokenBudgetLive),
  Layer.provide(TestRoutingPreferencesLive),
  Layer.provide(TestUsageMetricsLive),
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

  it("passes active RoutingPreference to ProviderRouter", async () => {
    observedRoutingContexts.length = 0
    testPrivacyMode = false
    testPreferredProvider = "openai"
    const response = await run(
      Effect.gen(function* () {
        const orch = yield* Orchestrator
        return yield* orch.run(makeTask({ id: "preferred-provider" }))
      }),
    )
    expect(response.taskId).toBe("preferred-provider")
    expect(observedRoutingContexts.at(-1)?.preferredProvider).toBe("openai")
  })

  it("passes localOnly when privacy mode is enabled", async () => {
    observedRoutingContexts.length = 0
    testPrivacyMode = true
    testPreferredProvider = undefined
    const response = await run(
      Effect.gen(function* () {
        const orch = yield* Orchestrator
        return yield* orch.run(makeTask({ id: "privacy-mode" }))
      }),
    )
    expect(response.taskId).toBe("privacy-mode")
    expect(observedRoutingContexts.at(-1)?.localOnly).toBe(true)
    testPrivacyMode = false
  })

  it("records UsageMetrics after a successful run", async () => {
    observedInferenceMetrics.length = 0
    const response = await run(
      Effect.gen(function* () {
        const orch = yield* Orchestrator
        return yield* orch.run(makeTask({ id: "metrics-run" }))
      }),
    )
    expect(response.taskId).toBe("metrics-run")
    expect(observedInferenceMetrics.at(-1)).toMatchObject({
      taskId: "metrics-run",
      provider: "anthropic",
      model: "claude-opus-4",
      inputTokens: 50,
      outputTokens: 30,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      estimatedCostUsd: 0.001,
      latencyMs: 120,
    })
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

  it("wires real cache tokens from provider into InferenceResponse usage", async () => {
    const response = await run(
      Effect.gen(function* () {
        const orch = yield* Orchestrator
        return yield* orch.runStream(
          {
            id: "t-cache",
            prompt: "hi",
            mode: "standard",
            createdAt: new Date().toISOString(),
          },
          vi.fn(),
        )
      }),
    )
    expect(response.usage.cacheReadTokens).toBe(300)
    expect(response.usage.cacheWriteTokens).toBe(50)
    expect(response.usage.estimatedCostUsd).toBe(0.002)
  })

  it("records real cache tokens in UsageMetrics after streaming", async () => {
    observedInferenceMetrics.length = 0
    await run(
      Effect.gen(function* () {
        const orch = yield* Orchestrator
        return yield* orch.runStream(
          {
            id: "t-cache-metrics",
            prompt: "hi",
            mode: "standard",
            createdAt: new Date().toISOString(),
          },
          vi.fn(),
        )
      }),
    )

    expect(observedInferenceMetrics.at(-1)).toMatchObject({
      taskId: "t-cache-metrics",
      cacheReadTokens: 300,
      cacheWriteTokens: 50,
      estimatedCostUsd: 0.002,
    })
  })
})
