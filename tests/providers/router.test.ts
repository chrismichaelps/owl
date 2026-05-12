/** @Owl.Tests.Providers.Router - Multi-provider routing logic tests */
import { describe, it, expect } from "vitest"
import { Effect } from "effect"
import * as Stream from "effect/Stream"
import {
  ProviderRouter,
  ProviderRouterLive,
  registerProvider,
} from "../../src/providers/router/index.js"
import type { LLMProviderService } from "../../src/providers/types.js"
import type { InferenceRequest } from "../../src/core/schema/index.js"

const makeStubProvider = (id: string): LLMProviderService => ({
  id,
  capabilities: [
    {
      providerId: id,
      modelId: `${id}-model`,
      contextWindow: 100000,
      maxOutputTokens: 4096,
      inputCostPer1k: 0.001,
      outputCostPer1k: 0.003,
      supportsStreaming: true,
      reasoningDepth: "medium",
      supportsFunctionCalling: true,
      supportsVision: false,
    },
  ],
  complete: (_req: InferenceRequest) =>
    Effect.succeed({
      taskId: _req.taskId,
      content: `response from ${id}`,
      stopReason: "end_turn" as const,
      usage: {
        inputTokens: 100,
        outputTokens: 50,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
      },
      model: `${id}-model`,
      provider: "anthropic" as const,
      latencyMs: 100,
    }),
  stream: (_req) => Stream.empty,
  countTokens: (_text, _modelId) => Effect.succeed(100),
  healthCheck: () => Effect.succeed(true),
})

describe("ProviderRouter", () => {
  it("routes to registered provider", async () => {
    const stub = makeStubProvider("anthropic")

    const program = Effect.gen(function* () {
      const router = yield* ProviderRouter
      yield* registerProvider(router, stub)
      const decision = yield* router.route({
        taskId: "t-001",
        mode: "standard",
        estimatedInputTokens: 1000,
        requiresReasoning: false,
        requiresVision: false,
        latencyBudgetMs: 30000,
      })
      return decision.selectedProvider
    })

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(ProviderRouterLive)),
    )
    expect(result).toBe("anthropic")
  })

  it("fails with ProviderUnavailableError when no providers registered", async () => {
    const program = Effect.gen(function* () {
      const router = yield* ProviderRouter
      return yield* router.route({
        taskId: "t-002",
        mode: "standard",
        estimatedInputTokens: 1000,
        requiresReasoning: false,
        requiresVision: false,
        latencyBudgetMs: 30000,
      })
    })

    const exit = await Effect.runPromiseExit(
      program.pipe(Effect.provide(ProviderRouterLive)),
    )
    expect(exit._tag).toBe("Failure")
  })
})
