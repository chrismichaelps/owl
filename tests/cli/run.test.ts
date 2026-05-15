/** @Owl.Tests.CLI.Runner - CLI runner error formatting tests */
import { describe, expect, it } from "vitest"
import { formatCliHelp, formatCliVersion } from "../../src/cli/help.js"
import { formatFatalError, runCli } from "../../src/cli/run.js"

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

describe("runCli metadata flags", () => {
  it("prints help without booting the runtime", async () => {
    const writes: string[] = []

    await runCli(["--help"], process.cwd(), {
      stdout: (text) => {
        writes.push(text)
      },
    })

    expect(writes).toEqual([formatCliHelp()])
  })

  it("prints version without booting the runtime", async () => {
    const writes: string[] = []

    await runCli(["--version"], process.cwd(), {
      stdout: (text) => {
        writes.push(text)
      },
    })

    expect(writes).toEqual([formatCliVersion()])
  })
})
