import { describe, it, expect } from "vitest"
import { Effect, Exit, Cause } from "effect"
import { parseCommand } from "../../src/commands/parser.js"

describe("parseCommand", () => {
  it("parses a command with no args", async () => {
    const result = await Effect.runPromise(parseCommand("/status"))
    expect(result.name).toBe("status")
    expect(result.args).toEqual([])
  })

  it("parses a command with multiple args", async () => {
    const result = await Effect.runPromise(parseCommand("/task write a function"))
    expect(result.name).toBe("task")
    expect(result.args).toEqual(["write", "a", "function"])
  })

  it("respects double-quoted args", async () => {
    const result = await Effect.runPromise(
      parseCommand('/edit file.ts "old text" "new text"'),
    )
    expect(result.name).toBe("edit")
    expect(result.args).toEqual(["file.ts", "old text", "new text"])
  })

  it("respects single-quoted args", async () => {
    const result = await Effect.runPromise(
      parseCommand("/edit file.ts 'old text' 'new text'"),
    )
    expect(result.name).toBe("edit")
    expect(result.args).toEqual(["file.ts", "old text", "new text"])
  })

  it("preserves the raw input string", async () => {
    const raw = "/task hello world"
    const result = await Effect.runPromise(parseCommand(raw))
    expect(result.raw).toBe(raw)
  })

  it("fails when input does not start with /", async () => {
    const exit = await Effect.runPromiseExit(parseCommand("task foo"))
    expect(Exit.isFailure(exit)).toBe(true)
    if (Exit.isFailure(exit)) {
      const err = Cause.failureOption(exit.cause)
      expect(err._tag).toBe("Some")
      if (err._tag === "Some") {
        expect(err.value._tag).toBe("CommandParseError")
      }
    }
  })

  it("fails when command name is empty", async () => {
    const exit = await Effect.runPromiseExit(parseCommand("/"))
    expect(Exit.isFailure(exit)).toBe(true)
    if (Exit.isFailure(exit)) {
      const err = Cause.failureOption(exit.cause)
      expect(err._tag).toBe("Some")
      if (err._tag === "Some") {
        expect(err.value._tag).toBe("CommandParseError")
      }
    }
  })
})
