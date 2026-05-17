/** @Owl.Tests.Commands.Model - RoutingPreference command tests */
import { describe, expect, it } from "vitest"
import { Effect } from "effect"
import { makeModelCommand } from "../../src/commands/management/model.js"
import {
  RoutingPreferences,
  RoutingPreferencesLive,
} from "../../src/providers/preferences/index.js"
import type { ProviderRouterService } from "../../src/providers/router/index.js"

const makeRouter = (
  providers: readonly string[] = ["anthropic", "openai"],
): ProviderRouterService => ({
  route: () => Effect.die("route not used in model command"),
  complete: () => Effect.die("complete not used in model command"),
  completeParallel: () =>
    Effect.die("completeParallel not used in model command"),
  completeWithCallback: () =>
    Effect.die("completeWithCallback not used in model command"),
  listProviders: () => Effect.succeed(providers),
  listCapabilities: () => Effect.succeed([]),
  listReliability: () => Effect.succeed([]),
  checkHealth: () => Effect.succeed([]),
})

const run = <A, E>(eff: Effect.Effect<A, E, RoutingPreferences>) =>
  Effect.runPromise(eff.pipe(Effect.provide(RoutingPreferencesLive)))

describe("makeModelCommand", () => {
  it("shows auto when no RoutingPreference is active", async () => {
    const output = await run(
      Effect.gen(function* () {
        const routingPreferences = yield* RoutingPreferences
        const command = makeModelCommand(routingPreferences, makeRouter())
        const result = yield* command.execute([])
        return result.output
      }),
    )
    expect(output).toContain("Active provider: auto")
    expect(output).toContain("Privacy mode: off")
  })

  it("sets a valid RoutingPreference", async () => {
    const preferredProvider = await run(
      Effect.gen(function* () {
        const routingPreferences = yield* RoutingPreferences
        const command = makeModelCommand(routingPreferences, makeRouter())
        yield* command.execute(["anthropic"])
        return yield* routingPreferences.getPreferredProvider()
      }),
    )
    expect(preferredProvider).toBe("anthropic")
  })

  it("clears RoutingPreference with auto", async () => {
    const preferredProvider = await run(
      Effect.gen(function* () {
        const routingPreferences = yield* RoutingPreferences
        const command = makeModelCommand(routingPreferences, makeRouter())
        yield* command.execute(["openai"])
        yield* command.execute(["auto"])
        return yield* routingPreferences.getPreferredProvider()
      }),
    )
    expect(preferredProvider).toBeUndefined()
  })

  it("rejects unknown providers", async () => {
    const exit = await Effect.runPromiseExit(
      Effect.gen(function* () {
        const routingPreferences = yield* RoutingPreferences
        const command = makeModelCommand(routingPreferences, makeRouter())
        return yield* command.execute(["unknown"])
      }).pipe(Effect.provide(RoutingPreferencesLive)),
    )
    expect(exit._tag).toBe("Failure")
  })

  it("rejects valid providers that are not registered", async () => {
    const exit = await Effect.runPromiseExit(
      Effect.gen(function* () {
        const routingPreferences = yield* RoutingPreferences
        const command = makeModelCommand(
          routingPreferences,
          makeRouter(["ollama"]),
        )
        return yield* command.execute(["anthropic"])
      }).pipe(Effect.provide(RoutingPreferencesLive)),
    )
    expect(exit._tag).toBe("Failure")
  })

  it("rejects cloud provider overrides while privacy mode is enabled", async () => {
    const exit = await Effect.runPromiseExit(
      Effect.gen(function* () {
        const routingPreferences = yield* RoutingPreferences
        yield* routingPreferences.setPrivacyMode(true)
        const command = makeModelCommand(routingPreferences, makeRouter())
        return yield* command.execute(["anthropic"])
      }).pipe(Effect.provide(RoutingPreferencesLive)),
    )
    expect(exit._tag).toBe("Failure")
  })

  it("allows local provider overrides while privacy mode is enabled", async () => {
    const preferredProvider = await run(
      Effect.gen(function* () {
        const routingPreferences = yield* RoutingPreferences
        yield* routingPreferences.setPrivacyMode(true)
        const command = makeModelCommand(
          routingPreferences,
          makeRouter(["ollama"]),
        )
        yield* command.execute(["ollama"])
        return yield* routingPreferences.getPreferredProvider()
      }),
    )
    expect(preferredProvider).toBe("ollama")
  })
})
