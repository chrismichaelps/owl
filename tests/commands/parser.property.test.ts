/** @Owl.Tests.Commands.ParserProperties - Deterministic parser property checks */
import { describe, expect, it } from "vitest"
import { Chunk, Effect } from "effect"
import { parseCommand } from "../../src/commands/parser.js"

const quoteArg = (arg: string): string =>
  arg.length === 0 || arg.includes(" ") ? JSON.stringify(arg) : arg

describe("parseCommand property-style regressions", () => {
  it("round-trips generated slash commands with quoted arguments", async () => {
    const names = Chunk.make("task", "deep", "edit", "compare")
    const argSets = Chunk.make(
      Chunk.make("alpha", "beta"),
      Chunk.make("file.ts", "old text", "new text"),
      Chunk.make("file.ts", "", "replacement"),
    )

    for (const name of names) {
      for (const args of argSets) {
        const raw =
          "/" +
          name +
          " " +
          Chunk.toReadonlyArray(Chunk.map(args, quoteArg)).join(" ")
        const parsed = await Effect.runPromise(parseCommand(raw))

        expect(parsed.name).toBe(name)
        expect(parsed.args).toEqual(Chunk.toReadonlyArray(args))
        expect(parsed.raw).toBe(raw)
      }
    }
  })

  it("ignores arbitrary extra whitespace between unquoted args", async () => {
    const cases = Chunk.make(
      "/task   alpha   beta",
      "/task\talpha\tbeta",
      "/task  alpha\t beta",
    )

    for (const raw of cases) {
      const parsed = await Effect.runPromise(parseCommand(raw))

      expect(parsed.name).toBe("task")
      expect(parsed.args).toEqual(["alpha", "beta"])
    }
  })
})
