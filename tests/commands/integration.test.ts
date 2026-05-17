/** @Owl.Tests.Commands.Integration - Parse-to-dispatch pipeline integration tests */
import { describe, expect, it } from "vitest"
import { Chunk, Effect } from "effect"
import {
  CommandRegistry,
  CommandRegistryLive,
} from "../../src/commands/registry.js"
import { parseCommand } from "../../src/commands/parser.js"
import type { CommandHandler } from "../../src/commands/types.js"

const echoHandler = (name: string): CommandHandler => ({
  name,
  description: "Echo args back",
  execute: (args) => Effect.succeed({ output: args.join("|") }),
})

const run = <A>(eff: Effect.Effect<A, never, CommandRegistry>) =>
  Effect.runPromise(eff.pipe(Effect.provide(CommandRegistryLive)))

describe("Commands integration: parse → dispatch", () => {
  it("dispatches a simple command end-to-end", async () => {
    const result = await run(
      Effect.gen(function* () {
        const registry = yield* CommandRegistry
        yield* registry.register(echoHandler("task"))
        const parsed = yield* parseCommand("/task do the thing").pipe(
          Effect.catchAll(() =>
            Effect.succeed({
              name: "",
              args: [] as readonly string[],
              raw: "",
            }),
          ),
        )
        const out = yield* registry
          .dispatch(parsed)
          .pipe(Effect.catchAll(() => Effect.succeed({ output: "error" })))
        return out.output
      }),
    )
    expect(result).toBe("do|the|thing")
  })

  it("dispatches a command with quoted args end-to-end", async () => {
    const result = await run(
      Effect.gen(function* () {
        const registry = yield* CommandRegistry
        yield* registry.register(echoHandler("edit"))
        const parsed = yield* parseCommand(
          '/edit "src/foo.ts" "old" "new"',
        ).pipe(
          Effect.catchAll(() =>
            Effect.succeed({
              name: "",
              args: [] as readonly string[],
              raw: "",
            }),
          ),
        )
        const out = yield* registry
          .dispatch(parsed)
          .pipe(Effect.catchAll(() => Effect.succeed({ output: "error" })))
        return out.output
      }),
    )
    expect(result).toBe("src/foo.ts|old|new")
  })

  it("returns CommandNotFoundError for an unregistered command", async () => {
    const result = await Effect.runPromiseExit(
      Effect.gen(function* () {
        const registry = yield* CommandRegistry
        const parsed = yield* parseCommand("/unknown").pipe(
          Effect.catchAll(() =>
            Effect.succeed({
              name: "unknown",
              args: [] as readonly string[],
              raw: "/unknown",
            }),
          ),
        )
        return yield* registry.dispatch(parsed)
      }).pipe(Effect.provide(CommandRegistryLive)),
    )
    expect(result._tag).toBe("Failure")
  })

  it("list returns all registered commands", async () => {
    const result = await run(
      Effect.gen(function* () {
        const registry = yield* CommandRegistry
        yield* registry.register(echoHandler("task"))
        yield* registry.register(echoHandler("deep"))
        yield* registry.register(echoHandler("plan"))
        return yield* registry.list()
      }),
    )
    expect(
      Chunk.toReadonlyArray(Chunk.map(result, (command) => command.name)),
    ).toEqual(["deep", "plan", "task"])
  })
})
