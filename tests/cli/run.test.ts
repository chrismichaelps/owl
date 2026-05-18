/** @Owl.Tests.CLI.Runner - CLI runner error formatting tests */
import type { ReactElement } from "react"
import { describe, expect, it } from "vitest"
import { formatCliHelp, formatCliVersion } from "../../src/cli/help.js"
import { formatFatalError, runCli } from "../../src/cli/run.js"
import { TOOL_PERMISSION_MODES } from "../../src/core/constants/index.js"

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

  it("passes the caller project root into the TUI app", async () => {
    const projectRoot = "/tmp/owl-runner-project"
    let rendered: ReactElement<{ readonly projectRoot?: string }> | undefined

    await runCli([], projectRoot, undefined, {
      render: (element) => {
        rendered = element as ReactElement<{ readonly projectRoot?: string }>
        return {
          waitUntilExit: () => Promise.resolve(),
        }
      },
    })

    expect(rendered?.props.projectRoot).toBe(projectRoot)
  })

  it("passes initial Permission mode into the TUI app", async () => {
    let rendered:
      | ReactElement<{ readonly initialPermissionMode?: string }>
      | undefined

    await runCli(["--permission-mode=plan"], process.cwd(), undefined, {
      render: (element) => {
        rendered = element as ReactElement<{
          readonly initialPermissionMode?: string
        }>
        return {
          waitUntilExit: () => Promise.resolve(),
        }
      },
    })

    expect(rendered?.props.initialPermissionMode).toBe(
      TOOL_PERMISSION_MODES.PLAN,
    )
  })

  it("passes initial Provider override into the TUI app", async () => {
    let rendered:
      | ReactElement<{ readonly initialProviderOverride?: string | null }>
      | undefined

    await runCli(["--model=ollama"], process.cwd(), undefined, {
      render: (element) => {
        rendered = element as ReactElement<{
          readonly initialProviderOverride?: string | null
        }>
        return {
          waitUntilExit: () => Promise.resolve(),
        }
      },
    })

    expect(rendered?.props.initialProviderOverride).toBe("ollama")
  })
})
