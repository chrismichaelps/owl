/**
 * @Owl.CLI.Entry - Main CLI entry point: launches Ink TUI
 *
 * Entry point for the Owl CLI application. Sets up the managed runtime,
 * parses CLI arguments, and launches the Ink TUI.
 *
 * Flow:
 * 1. Parse command-line arguments (mode, prompt)
 * 2. Create managed runtime with all services wired
 * 3. Render Ink App component with runtime and initial state
 * 4. Wait for user exit (Ctrl+C)
 * 5. Dispose runtime on exit
 *
 * @example
 * # Run with default mode
 * owl "Create a function"
 *
 * # Run in deep mode
 * owl --deep "Analyze this architecture"
 */
import React from "react"
import { render } from "ink"
import { App } from "../tui/app.js"
import { makeOwlRuntime } from "./runtime.js"
import { parseArgs } from "./args.js"

/** @Owl.CLI.Entry.Main - Async entry point with error handling */
async function main(): Promise<void> {
  const { mode, prompt } = parseArgs(process.argv.slice(2))
  const runtime = makeOwlRuntime(process.cwd())

  const { waitUntilExit } = render(
    React.createElement(App, {
      runtime,
      initialMode: mode,
      initialPrompt: prompt,
    }),
  )

  await waitUntilExit()
  await runtime.dispose()
}

/** @Owl.CLI.Entry.Boot - Bootstrap with global error handler */
void main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err)
  process.stderr.write(`[Owl] Fatal error: ${msg}\n`)
  process.exit(1)
})
