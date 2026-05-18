/**
 * @Owl.CLI.Runner - Shared CLI launch workflow
 *
 * Owns the process-facing CLI boot sequence so every executable entry point
 * launches the same runtime and TUI path.
 */
import React from "react"
import { render } from "ink"
import type { ReactElement } from "react"
import { App } from "../tui/app.js"
import { makeOwlRuntime } from "./runtime.js"
import { parseArgs } from "./args.js"
import { formatCliHelp, formatCliVersion } from "./help.js"

/** @Owl.CLI.Runner.Output - Testable process output port */
export interface CliOutput {
  readonly stdout: (text: string) => void
}

/** @Owl.CLI.Runner.Renderer - Testable Ink render port */
export interface CliRenderer {
  readonly render: (element: ReactElement) => {
    readonly waitUntilExit: () => Promise<void>
  }
}

const DEFAULT_OUTPUT: CliOutput = {
  stdout: (text) => {
    process.stdout.write(text)
  },
}

const DEFAULT_RENDERER: CliRenderer = {
  render: (element) => {
    const instance = render(element)
    return {
      waitUntilExit: () => instance.waitUntilExit().then(() => undefined),
    }
  },
}

/** @Owl.CLI.Runner.Error - Formats fatal boot failures */
export const formatFatalError = (error: unknown): string => {
  const message = error instanceof Error ? error.message : String(error)
  return `[Owl] Fatal error: ${message}\n`
}

/** @Owl.CLI.Runner.Main - Launches runtime-backed TUI */
export async function runCli(
  argv: readonly string[],
  projectRoot: string,
  output: CliOutput = DEFAULT_OUTPUT,
  renderer: CliRenderer = DEFAULT_RENDERER,
): Promise<void> {
  const { mode, prompt, permissionMode, providerOverride, help, version } =
    parseArgs(argv)

  if (help) {
    output.stdout(formatCliHelp())
    return
  }

  if (version) {
    output.stdout(formatCliVersion())
    return
  }

  const runtime = makeOwlRuntime(projectRoot)

  try {
    const { waitUntilExit } = renderer.render(
      React.createElement(App, {
        runtime,
        projectRoot,
        initialMode: mode,
        initialPermissionMode: permissionMode,
        initialProviderOverride: providerOverride,
        initialPrompt: prompt,
      }),
    )

    await waitUntilExit()
  } finally {
    await runtime.dispose()
  }
}

/** @Owl.CLI.Runner.Boot - Process-level CLI error boundary */
export function bootCli(
  argv: readonly string[] = process.argv.slice(2),
  projectRoot: string = process.cwd(),
): void {
  void runCli(argv, projectRoot).catch((error: unknown) => {
    process.stderr.write(formatFatalError(error))
    process.exit(1)
  })
}
