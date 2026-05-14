/** @Owl.Tests.Commands.Model - RoutingPreference command tests */
import { describe, expect, it } from "vitest"
import { Effect } from "effect"
import { makeModelCommand } from "../../src/commands/management/model.js"
import {
  RoutingPreferences,
  RoutingPreferencesLive,
} from "../../src/providers/preferences/index.js"

const run = <A, E>(eff: Effect.Effect<A, E, RoutingPreferences>) =>
  Effect.runPromise(eff.pipe(Effect.provide(RoutingPreferencesLive)))

describe("makeModelCommand", () => {
  it("shows auto when no RoutingPreference is active", async () => {
    const output = await run(
      Effect.gen(function* () {
        const routingPreferences = yield* RoutingPreferences
        const command = makeModelCommand(routingPreferences)
        const result = yield* command.execute([])
        return result.output
      }),
    )
    expect(output).toContain("Active provider: auto")
  })

  it("sets a valid RoutingPreference", async () => {
    const preferredProvider = await run(
      Effect.gen(function* () {
        const routingPreferences = yield* RoutingPreferences
        const command = makeModelCommand(routingPreferences)
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
        const command = makeModelCommand(routingPreferences)
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
        const command = makeModelCommand(routingPreferences)
        return yield* command.execute(["unknown"])
      }).pipe(Effect.provide(RoutingPreferencesLive)),
    )
    expect(exit._tag).toBe("Failure")
  })
})
