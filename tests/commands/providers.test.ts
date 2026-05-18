/** @Owl.Tests.Commands.Providers - Provider capability command tests */
import { describe, expect, it } from "vitest"
import { Chunk, Effect } from "effect"
import {
  makeProvidersCommand,
  formatProviderCapability,
  formatProviderHealth,
  formatProviderReliability,
} from "../../src/commands/management/providers.js"
import {
  RoutingPreferences,
  RoutingPreferencesLive,
} from "../../src/providers/preferences/index.js"
import type { ProviderCapability } from "../../src/providers/types.js"
import type { ProviderRouterService } from "../../src/providers/router/index.js"

const CAPABILITY: ProviderCapability = {
  providerId: "anthropic",
  modelId: "claude-opus-4-5",
  contextWindow: 200000,
  maxOutputTokens: 8192,
  inputCostPer1k: 0.015,
  outputCostPer1k: 0.075,
  supportsStreaming: true,
  reasoningDepth: "high",
  supportsFunctionCalling: true,
  supportsVision: true,
}

const makeRouter = (
  capabilities: readonly ProviderCapability[],
): ProviderRouterService => ({
  route: () => Effect.die("route not used in providers command"),
  complete: () => Effect.die("complete not used in providers command"),
  completeParallel: () =>
    Effect.die("completeParallel not used in providers command"),
  completeWithCallback: () =>
    Effect.die("completeWithCallback not used in providers command"),
  listProviders: () =>
    Effect.succeed(
      Chunk.map(
        Chunk.fromIterable(capabilities),
        (capability) => capability.providerId,
      ),
    ),
  listCapabilities: () => Effect.succeed(Chunk.fromIterable(capabilities)),
  listReliability: () => Effect.succeed(Chunk.empty()),
  checkHealth: () =>
    Effect.succeed(
      Chunk.map(Chunk.fromIterable(capabilities), (capability) => ({
        provider: capability.providerId,
        healthy: true,
        message: null,
      })),
    ),
})

const run = <A, E>(eff: Effect.Effect<A, E, RoutingPreferences>) =>
  Effect.runPromise(eff.pipe(Effect.provide(RoutingPreferencesLive)))

describe("formatProviderCapability", () => {
  it("renders provider, model, reasoning depth, context, and cost", () => {
    const output = formatProviderCapability(CAPABILITY)
    expect(output).toContain("anthropic/claude-opus-4-5")
    expect(output).toContain("high reasoning")
    expect(output).toContain("200000 ctx")
    expect(output).toContain("per 1K")
  })
})

describe("formatProviderHealth", () => {
  it("renders healthy and unhealthy providers", () => {
    expect(
      formatProviderHealth({
        provider: "anthropic",
        healthy: true,
        message: null,
      }),
    ).toBe("- anthropic: healthy")

    expect(
      formatProviderHealth({
        provider: "ollama",
        healthy: false,
        message: "connection refused",
      }),
    ).toBe("- ollama: unhealthy — connection refused")
  })
})

describe("formatProviderReliability", () => {
  it("renders adaptive routing memory", () => {
    expect(
      formatProviderReliability({
        provider: "anthropic",
        successes: 3,
        failures: 1,
        consecutiveFailures: 1,
        score: 0.55,
      }),
    ).toBe("- anthropic: score 0.55 · 3 ok / 1 fail · 1 consecutive")
  })
})

describe("makeProvidersCommand", () => {
  it("lists registered capabilities", async () => {
    const output = await run(
      Effect.gen(function* () {
        const preferences = yield* RoutingPreferences
        const command = makeProvidersCommand(
          makeRouter([CAPABILITY]),
          preferences,
        )
        const result = yield* command.execute([])
        return result.output
      }),
    )
    expect(output).toContain("Active provider: auto")
    expect(output).toContain("Registered models:")
    expect(output).toContain("claude-opus-4-5")
    expect(output).toContain("Provider health:")
    expect(output).toContain("- anthropic: healthy")
  })

  it("supports models as a command alias", async () => {
    const output = await run(
      Effect.gen(function* () {
        const preferences = yield* RoutingPreferences
        const command = makeProvidersCommand(
          makeRouter([CAPABILITY]),
          preferences,
          "models",
        )
        const result = yield* command.execute([])
        return { name: command.name, output: result.output }
      }),
    )
    expect(output.name).toBe("models")
    expect(output.output).toContain("Registered models:")
  })

  it("reports empty provider registration state", async () => {
    const output = await run(
      Effect.gen(function* () {
        const preferences = yield* RoutingPreferences
        const command = makeProvidersCommand(makeRouter([]), preferences)
        const result = yield* command.execute([])
        return result.output
      }),
    )
    expect(output).toContain("No providers are registered.")
  })

  it("shows routing reliability when the router has attempt history", async () => {
    const router = {
      ...makeRouter([CAPABILITY]),
      listReliability: () =>
        Effect.succeed(
          Chunk.make({
            provider: "anthropic",
            successes: 2,
            failures: 1,
            consecutiveFailures: 0,
            score: 0.67,
          }),
        ),
    } satisfies ProviderRouterService

    const output = await run(
      Effect.gen(function* () {
        const preferences = yield* RoutingPreferences
        const command = makeProvidersCommand(router, preferences)
        const result = yield* command.execute([])
        return result.output
      }),
    )

    expect(output).toContain("Routing reliability:")
    expect(output).toContain("- anthropic: score 0.67 · 2 ok / 1 fail")
  })
})
