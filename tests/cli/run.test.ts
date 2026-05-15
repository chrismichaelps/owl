/** @Owl.Tests.CLI.Runner - CLI runner error formatting tests */
import { describe, expect, it } from "vitest"
import { formatFatalError } from "../../src/cli/run.js"

describe("formatFatalError", () => {
  it("formats Error instances for process stderr", () => {
    expect(formatFatalError(new Error("boom"))).toBe(
      "[Owl] Fatal error: boom\n",
    )
  })

  it("formats unknown thrown values deterministically", () => {
    expect(formatFatalError("bad state")).toBe("[Owl] Fatal error: bad state\n")
  })
})
