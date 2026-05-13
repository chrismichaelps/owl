/** @Owl.CLI.Entry - Main CLI entry point: launches Ink TUI */
import React from "react"
import { render } from "ink"
import { App } from "../tui/app.js"
import { makeOwlRuntime } from "./runtime.js"
import { parseArgs } from "./args.js"

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

void main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err)
  process.stderr.write(`[Owl] Fatal error: ${msg}\n`)
  process.exit(1)
})
