/**
 * @Owl.CLI.Runner - Shared CLI launch workflow
 *
 * Owns the process-facing CLI boot sequence so every executable entry point
 * launches the same runtime and TUI path.
 */
import React from "react"
import { render } from "ink"
import { App } from "../tui/app.js"
import { makeOwlRuntime } from "./runtime.js"
import { parseArgs } from "./args.js"

/** @Owl.CLI.Runner.Error - Formats fatal boot failures */
export const formatFatalError = (error: unknown): string => {
  const message = error instanceof Error ? error.message : String(error)
  return `[Owl] Fatal error: ${message}\n`
}

/** @Owl.CLI.Runner.Main - Launches runtime-backed TUI */
export async function runCli(
  argv: readonly string[],
  projectRoot: string,
): Promise<void> {
  const { mode, prompt } = parseArgs(argv)
  const runtime = makeOwlRuntime(projectRoot)

  try {
    const { waitUntilExit } = render(
      React.createElement(App, {
        runtime,
        initialMode: mode,
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
