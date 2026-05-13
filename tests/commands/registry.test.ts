import { describe, it, expect } from "vitest"
import { Effect, Exit, Cause } from "effect"
import {
  CommandRegistry,
  CommandRegistryLive,
} from "../../src/commands/registry.js"
import type { CommandHandler, ParsedCommand } from "../../src/commands/types.js"

const stubHandler = (name: string): CommandHandler => ({
  name,
  description: "Stub handler for " + name,
  execute: (_args) => Effect.succeed({ output: "ran " + name }),
})

/** Helper for success paths — casts away error channel since runPromise rejects on failure */
const run = <A>(eff: Effect.Effect<A, never, CommandRegistry>) =>
  Effect.runPromise(eff.pipe(Effect.provide(CommandRegistryLive)))

describe("CommandRegistry", () => {
  it("lookup succeeds for a registered command", async () => {
    const result = await run(
      Effect.gen(function* () {
        const registry = yield* CommandRegistry
        yield* registry.register(stubHandler("foo"))
        const handler = yield* registry.lookup("foo")
        return handler.name
      }).pipe(Effect.catchAll(() => Effect.succeed("error"))),
    )
    expect(result).toBe("foo")
  })

  it("lookup fails with CommandNotFoundError for unknown command", async () => {
    const exit = await Effect.runPromiseExit(
      Effect.gen(function* () {
        const registry = yield* CommandRegistry
        return yield* registry.lookup("nonexistent")
      }).pipe(Effect.provide(CommandRegistryLive)),
    )
    expect(Exit.isFailure(exit)).toBe(true)
    if (Exit.isFailure(exit)) {
      const err = Cause.failureOption(exit.cause)
      expect(err._tag).toBe("Some")
      if (err._tag === "Some") {
        expect(err.value._tag).toBe("CommandNotFoundError")
      }
    }
  })

  it("list returns all registered commands", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const registry = yield* CommandRegistry
        yield* registry.register(stubHandler("foo"))
        yield* registry.register(stubHandler("bar"))
        return yield* registry.list()
      }).pipe(Effect.provide(CommandRegistryLive)),
    )
    const names = result.map((r) => r.name)
    expect(names).toContain("foo")
    expect(names).toContain("bar")
  })

  it("dispatch runs the correct handler", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const registry = yield* CommandRegistry
        yield* registry.register(stubHandler("baz"))
        const parsed: ParsedCommand = { name: "baz", args: [], raw: "/baz" }
        return yield* registry.dispatch(parsed)
      }).pipe(
        Effect.provide(CommandRegistryLive),
        Effect.catchAll(() => Effect.succeed({ output: "error" })),
      ),
    )
    expect(result.output).toBe("ran baz")
  })

  it("dispatch fails with CommandNotFoundError for missing command", async () => {
    const exit = await Effect.runPromiseExit(
      Effect.gen(function* () {
        const registry = yield* CommandRegistry
        const parsed: ParsedCommand = {
          name: "ghost",
          args: [],
          raw: "/ghost",
        }
        return yield* registry.dispatch(parsed)
      }).pipe(Effect.provide(CommandRegistryLive)),
    )
    expect(Exit.isFailure(exit)).toBe(true)
    if (Exit.isFailure(exit)) {
      const err = Cause.failureOption(exit.cause)
      expect(err._tag).toBe("Some")
      if (err._tag === "Some") {
        expect(err.value._tag).toBe("CommandNotFoundError")
      }
    }
  })
})
