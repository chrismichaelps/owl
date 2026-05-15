/** @Owl.Tests.Commands.Prompt - Shared command text validation tests */
import { describe, expect, it } from "vitest"
import { Cause, Effect, Exit } from "effect"
import { COMMAND_CONSTANTS } from "../../src/core/constants/index.js"
import { requireCommandText } from "../../src/commands/utils/prompt.js"

describe("requireCommandText", () => {
  it("trims and joins command arguments", async () => {
    const text = await Effect.runPromise(
      requireCommandText("task", ["  hello", "world  "], "Prompt"),
    )

    expect(text).toBe("hello world")
  })

  it("fails when the command text is empty", async () => {
    const exit = await Effect.runPromiseExit(
      requireCommandText("task", ["   "], "Prompt"),
    )

    expect(Exit.isFailure(exit)).toBe(true)
  })

  it("fails when the command text exceeds the configured maximum", async () => {
    const oversized = "x".repeat(COMMAND_CONSTANTS.MAX_PROMPT_LENGTH + 1)
    const exit = await Effect.runPromiseExit(
      requireCommandText("task", [oversized], "Prompt"),
    )

    expect(Exit.isFailure(exit)).toBe(true)
    if (Exit.isFailure(exit)) {
      const error = Cause.failureOption(exit.cause)
      expect(error._tag).toBe("Some")
      if (error._tag === "Some") {
        expect(error.value.reason).toContain(
          String(COMMAND_CONSTANTS.MAX_PROMPT_LENGTH),
        )
      }
    }
  })
})
