/** @Owl.CLI.Entry - Main CLI entry point: launches Ink TUI */
import React from "react"
import { render } from "ink"
import { App } from "../tui/app.js"
import { makeOwlRuntime } from "./runtime.js"
import { parseArgs } from "./args.js"

async function main(): Promise<void> {
  const { mode } = parseArgs(process.argv.slice(2))
  const runtime = makeOwlRuntime()

  const { waitUntilExit } = render(
    React.createElement(App, { runtime, initialMode: mode }),
  )

  await waitUntilExit()
  await runtime.dispose()
}

void main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err)
  process.stderr.write(`[Owl] Fatal error: ${msg}\n`)
  process.exit(1)
})
