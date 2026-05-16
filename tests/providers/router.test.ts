/** @Owl.Tests.Providers.Router - Multi-provider routing logic tests */
import { describe, it, expect } from "vitest"
import { Effect } from "effect"
import * as Stream from "effect/Stream"
import {
  ProviderRouter,
  ProviderRouterLive,
  formatStreamEventLog,
  registerProvider,
} from "../../src/providers/router/index.js"
import {
  ProviderError,
  ProviderStreamError,
} from "../../src/core/errors/index.js"
import type {
  LLMProviderService,
  StreamChunk,
} from "../../src/providers/types.js"
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

const makeObservableProvider = (id: ProviderId): LLMProviderService => ({
  ...makeStubProvider(id),
  stream: () =>
    Stream.make<StreamChunk>(
      {
        type: "thinking",
        content: "checking context",
        index: 0,
      },
      {
        type: "tool_use",
        content: "filesystem__read_file",
        index: 1,
      },
      {
        type: "text",
        content: "done",
        index: 2,
      },
      {
        type: "usage",
        index: 3,
        usage: {
          inputTokens: 100,
          outputTokens: 50,
          cacheReadTokens: 0,
          cacheWriteTokens: 0,
          estimatedCostUsd: 0,
        },
      },
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

  it("completeWithCallback forwards thinking and tool events to logs", async () => {
    const provider = makeObservableProvider("anthropic")
    const logs: string[] = []

    const program = Effect.gen(function* () {
      const router = yield* ProviderRouter
      yield* registerProvider(router, provider)
      return yield* router.completeWithCallback(
        {
          taskId: "t-stream-observable",
          mode: "standard",
          estimatedInputTokens: 1000,
          requiresReasoning: false,
          requiresVision: false,
          latencyBudgetMs: 30000,
        },
        {
          taskId: "t-stream-observable",
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
        () => undefined,
        (message) => {
          logs.push(message)
        },
      )
    })

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(ProviderRouterLive)),
    )
    expect(result.content).toBe("done")
    expect(logs).toEqual([
      "◌ Thinking: checking context",
      "⚙ Tool: filesystem__read_file",
    ])
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

  it("lists registered model capabilities deterministically", async () => {
    const first = makeStubProvider("openai")
    const second = makeStubProvider("anthropic")

    const program = Effect.gen(function* () {
      const router = yield* ProviderRouter
      yield* registerProvider(router, first)
      yield* registerProvider(router, second)
      return yield* router.listCapabilities()
    })

    const capabilities = await Effect.runPromise(
      program.pipe(Effect.provide(ProviderRouterLive)),
    )
    expect(capabilities.map((capability) => capability.providerId)).toEqual([
      "anthropic",
      "openai",
    ])
  })
})

describe("formatStreamEventLog", () => {
  it("formats thinking chunks with bounded previews", () => {
    const message = formatStreamEventLog({
      type: "thinking",
      content: "a".repeat(100),
      index: 0,
    })
    expect(message).toBe("◌ Thinking: " + "a".repeat(80) + "…")
  })

  it("ignores text chunks because they stream to the output panel", () => {
    expect(
      formatStreamEventLog({ type: "text", content: "hello", index: 0 }),
    ).toBeNull()
  })
})
