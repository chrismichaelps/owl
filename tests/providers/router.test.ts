/** @Owl.Tests.Providers.Router - Multi-provider routing logic tests */
import { describe, it, expect } from "vitest"
import { Effect } from "effect"
import * as Stream from "effect/Stream"
import {
  ProviderRouter,
  ProviderRouterLive,
  registerProvider,
} from "../../src/providers/router/index.js"
import {
  ProviderError,
  ProviderStreamError,
} from "../../src/core/errors/index.js"
import type { LLMProviderService } from "../../src/providers/types.js"
import type {
  InferenceRequest,
  ProviderId,
} from "../../src/core/schema/index.js"

/** @Owl.Tests.Providers.Router.Stubs - Mock provider definitions */
const makeStubProvider = (id: ProviderId): LLMProviderService => ({
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
        estimatedCostUsd: 0,
      },
      model: `${id}-model`,
      provider: id,
      latencyMs: 100,
    }),
  stream: (_req) =>
    Stream.make(
      {
        type: "text" as const,
        content: `stream from ${id}`,
        index: 0,
      },
      {
        type: "usage" as const,
        index: 1,
        usage: {
          inputTokens: 100,
          outputTokens: 50,
          cacheReadTokens: 0,
          cacheWriteTokens: 0,
          estimatedCostUsd: 0,
        },
      },
    ),
  countTokens: (_text, _modelId) => Effect.succeed(100),
  healthCheck: () => Effect.succeed(true),
})

const makeFailingProvider = (id: ProviderId): LLMProviderService => ({
  ...makeStubProvider(id),
  complete: () =>
    Effect.fail(
      new ProviderError({
        provider: id,
        message: `${id} failed`,
      }),
    ),
  stream: () =>
    Stream.fail(
      new ProviderStreamError({
        provider: id,
        cause: `${id} stream failed`,
      }),
    ),
})

/** @Owl.Tests.Providers.Router.Logic - Selection and error path tests */
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

  it("complete falls back when the selected provider fails", async () => {
    const first = makeFailingProvider("anthropic")
    const fallback = makeStubProvider("openai")

    const program = Effect.gen(function* () {
      const router = yield* ProviderRouter
      yield* registerProvider(router, first)
      yield* registerProvider(router, fallback)
      return yield* router.complete(
        {
          taskId: "t-fallback",
          mode: "standard",
          estimatedInputTokens: 1000,
          requiresReasoning: false,
          requiresVision: false,
          latencyBudgetMs: 30000,
        },
        {
          taskId: "t-fallback",
          messages: [
            {
              role: "user",
              content: "hello",
              timestamp: new Date().toISOString(),
            },
          ],
          maxTokens: 1024,
          stream: false,
        },
      )
    })

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(ProviderRouterLive)),
    )
    expect(result.provider).toBe("openai")
    expect(result.content).toBe("response from openai")
    expect(result.usage.estimatedCostUsd).toBe(0.00025)
  })

  it("completeWithCallback falls back when stream fails before chunks", async () => {
    const first = makeFailingProvider("anthropic")
    const fallback = makeStubProvider("openai")
    const chunks: string[] = []

    const program = Effect.gen(function* () {
      const router = yield* ProviderRouter
      yield* registerProvider(router, first)
      yield* registerProvider(router, fallback)
      return yield* router.completeWithCallback(
        {
          taskId: "t-stream-fallback",
          mode: "standard",
          estimatedInputTokens: 1000,
          requiresReasoning: false,
          requiresVision: false,
          latencyBudgetMs: 30000,
        },
        {
          taskId: "t-stream-fallback",
          messages: [
            {
              role: "user",
              content: "hello",
              timestamp: new Date().toISOString(),
            },
          ],
          maxTokens: 1024,
          stream: true,
        },
        (chunk) => {
          chunks.push(chunk)
        },
      )
    })

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(ProviderRouterLive)),
    )
    expect(result.provider).toBe("openai")
    expect(result.content).toBe("stream from openai")
    expect(result.estimatedCostUsd).toBe(0.00025)
    expect(chunks).toEqual(["stream from openai"])
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
