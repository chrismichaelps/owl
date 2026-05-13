/** @Owl.CLI.Args - Pure CLI argument parser; no side-effects, fully testable */
import type { Mode } from "../core/schema/index.js"

export const VALID_MODES: readonly string[] = [
  "standard",
  "quick",
  "deep",
  "economy",
  "god",
]

export interface ParsedArgs {
  readonly mode: Mode
  readonly prompt: string | null
}

/**
 * Parse an array of CLI tokens into a typed ParsedArgs.
 * Accepts process.argv.slice(2) or any string array for testing.
 *
 * Supported forms:
 *   owl                           → { mode: "standard", prompt: null }
 *   owl "my task"                 → { mode: "standard", prompt: "my task" }
 *   owl --mode=deep "my task"     → { mode: "deep",     prompt: "my task" }
 *   owl --quick "my task"         → { mode: "quick",    prompt: "my task" }
 *   owl -q "my task"              → { mode: "quick",    prompt: "my task" }
 *   owl --deep "my task"          → { mode: "deep",     prompt: "my task" }
 *   owl -d "my task"              → { mode: "deep",     prompt: "my task" }
 *   owl --economy                 → { mode: "economy",  prompt: null }
 *   owl -e                        → { mode: "economy",  prompt: null }
 *   owl --mode=invalid "prompt"   → { mode: "standard", prompt: "prompt" }
 */
export function parseArgs(argv: readonly string[]): ParsedArgs {
  let mode: Mode = "standard"
  let prompt: string | null = null

  for (const arg of argv) {
    if (arg.startsWith("--mode=")) {
      const val = arg.slice("--mode=".length)
      if (VALID_MODES.includes(val)) mode = val as Mode
    } else if (arg === "--quick" || arg === "-q") {
      mode = "quick"
    } else if (arg === "--deep" || arg === "-d") {
      mode = "deep"
    } else if (arg === "--economy" || arg === "-e") {
      mode = "economy"
    } else if (!arg.startsWith("-")) {
      prompt ??= arg
    }
  }

  return { mode, prompt }
}
