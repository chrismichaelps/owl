/** @Owl.Tests.Commands.Help - Registry-backed help command tests */
import { describe, expect, it } from "vitest"
import { Effect } from "effect"
import {
  CommandRegistry,
  CommandRegistryLive,
} from "../../src/commands/registry.js"
import { makeHelpCommand } from "../../src/commands/management/help.js"
import type { CommandHandler } from "../../src/commands/types.js"

const makeStubCommand = (
  name: string,
  description: string,
): CommandHandler => ({
  name,
  description,
  execute: () => Effect.succeed({ output: name }),
})

describe("makeHelpCommand", () => {
  it("lists registered slash commands sorted by name", async () => {
    const output = await Effect.runPromise(
      Effect.gen(function* () {
        const registry = yield* CommandRegistry
        yield* registry.register(makeStubCommand("zeta", "Last command"))
        yield* registry.register(makeStubCommand("alpha", "First command"))
        yield* registry.register(makeHelpCommand(registry))
        const result = yield* registry.dispatch({
          name: "help",
          args: [],
          raw: "/help",
        })
        return result.output
      }).pipe(Effect.provide(CommandRegistryLive)),
    )

    expect(output.split("\n")).toEqual([
      "/alpha - First command",
      "/help - List available slash commands: /help",
      "/zeta - Last command",
    ])
  })
})
