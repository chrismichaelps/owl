/** @Owl.Tests.Commands.Privacy - Local-only routing command tests */
import { describe, expect, it } from "vitest"
import { Effect } from "effect"
import { makePrivacyCommand } from "../../src/commands/management/privacy.js"
import {
  RoutingPreferences,
  RoutingPreferencesLive,
} from "../../src/providers/preferences/index.js"

const run = <A, E>(eff: Effect.Effect<A, E, RoutingPreferences>) =>
  Effect.runPromise(eff.pipe(Effect.provide(RoutingPreferencesLive)))

describe("makePrivacyCommand", () => {
  it("shows privacy mode status", async () => {
    const output = await run(
      Effect.gen(function* () {
        const preferences = yield* RoutingPreferences
        const command = makePrivacyCommand(preferences)
        const result = yield* command.execute([])
        return result.output
      }),
    )

    expect(output).toContain("Privacy mode: off")
  })

  it("enables local-only routing", async () => {
    const enabled = await run(
      Effect.gen(function* () {
        const preferences = yield* RoutingPreferences
        const command = makePrivacyCommand(preferences)
        yield* command.execute(["on"])
        return yield* preferences.getPrivacyMode()
      }),
    )

    expect(enabled).toBe(true)
  })

  it("disables local-only routing", async () => {
    const enabled = await run(
      Effect.gen(function* () {
        const preferences = yield* RoutingPreferences
        const command = makePrivacyCommand(preferences)
        yield* command.execute(["on"])
        yield* command.execute(["off"])
        return yield* preferences.getPrivacyMode()
      }),
    )

    expect(enabled).toBe(false)
  })

  it("rejects invalid privacy mode values", async () => {
    const exit = await Effect.runPromiseExit(
      Effect.gen(function* () {
        const preferences = yield* RoutingPreferences
        const command = makePrivacyCommand(preferences)
        return yield* command.execute(["maybe"])
      }).pipe(Effect.provide(RoutingPreferencesLive)),
    )

    expect(exit._tag).toBe("Failure")
  })
})
