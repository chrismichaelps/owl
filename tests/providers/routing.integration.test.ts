/** @Owl.Tests.Providers.RoutingIntegration - ProviderRouter registered adapter flow */
import { describe, expect, it } from "vitest"
import { Effect } from "effect"
import * as Stream from "effect/Stream"
import {
  ProviderRouter,
  ProviderRouterLive,
  registerProvider,
} from "../../src/providers/router/index.js"
import type {
  LLMProviderService,
  RoutingContext,
  StreamChunk,
} from "../../src/providers/types.js"
import type { InferenceRequest } from "../../src/core/schema/index.js"

const makeStubAdapter = (): LLMProviderService => ({
  id: "anthropic",
  capabilities: [
    {
      providerId: "anthropic",
      modelId: "stub-model",
      contextWindow: 100_000,
      maxOutputTokens: 8_192,
      inputCostPer1k: 0.001,
      outputCostPer1k: 0.003,
      supportsStreaming: true,
      reasoningDepth: "high",
      supportsFunctionCalling: false,
      supportsVision: false,
    },
  ],
  complete: (req: InferenceRequest) =>
    Effect.succeed({
      taskId: req.taskId,
      content: "stub response",
      stopReason: "end_turn" as const,
      usage: {
        inputTokens: 10,
        outputTokens: 5,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
      },
      model: "stub-model",
      provider: "anthropic" as const,
      latencyMs: 1,
    }),
  stream: (_req: InferenceRequest) =>
    Stream.make<StreamChunk>(
      { type: "text", content: "stub ", index: 0 },
      { type: "text", content: "stream", index: 1 },
    ),
  countTokens: (text: string, _modelId: string) =>
    Effect.succeed(Math.ceil(text.length / 4)),
  healthCheck: () => Effect.succeed(true),
})

const routingCtx: RoutingContext = {
  taskId: "test-task",
  mode: "standard",
  estimatedInputTokens: 100,
  requiresReasoning: false,
  requiresVision: false,
  latencyBudgetMs: 5_000,
}

const run = <A>(
  effect: Effect.Effect<A, unknown, ProviderRouter>,
): Promise<A> => {
  const stub = makeStubAdapter()
  const withStub = Effect.gen(function* () {
    const router = yield* ProviderRouter
    yield* registerProvider(router, stub)
    return yield* effect
  })
  return Effect.runPromise(withStub.pipe(Effect.provide(ProviderRouterLive)))
}

describe("ProviderRouter integration", () => {
  it("route selects a registered provider", async () => {
    const decision = await run(
      Effect.gen(function* () {
        const router = yield* ProviderRouter
        return yield* router.route(routingCtx)
      }),
    )

    expect(decision.selectedProvider).toBe("anthropic")
    expect(decision.selectedModel).toBe("stub-model")
  })

  it("complete delegates to the registered provider", async () => {
    const response = await run(
      Effect.gen(function* () {
        const router = yield* ProviderRouter
        return yield* router.complete(routingCtx, {
          taskId: "test-task",
          messages: [
            {
              role: "user",
              content: "hello",
              timestamp: new Date().toISOString(),
            },
          ],
          maxTokens: 1_024,
          stream: false,
        })
      }),
    )

    expect(response.content).toBe("stub response")
    expect(response.stopReason).toBe("end_turn")
  })

  it("completeWithCallback emits every text chunk", async () => {
    const chunks: string[] = []
    const result = await run(
      Effect.gen(function* () {
        const router = yield* ProviderRouter
        return yield* router.completeWithCallback(
          routingCtx,
          {
            taskId: "test-task",
            messages: [
              {
                role: "user",
                content: "hello",
                timestamp: new Date().toISOString(),
              },
            ],
            maxTokens: 1_024,
            stream: true,
          },
          (chunk) => {
            chunks.push(chunk)
          },
        )
      }),
    )

    expect(chunks).toEqual(["stub ", "stream"])
    expect(result.content).toBe("stub stream")
    expect(result.provider).toBe("anthropic")
  })

  it("listProviders returns registered provider ids", async () => {
    const providers = await run(
      Effect.gen(function* () {
        const router = yield* ProviderRouter
        return yield* router.listProviders()
      }),
    )

    expect(providers).toContain("anthropic")
  })
})
