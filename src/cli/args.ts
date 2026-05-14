/**
 * @Owl.CLI.Args - Pure CLI argument parser; no side-effects, fully testable
 *
 * Parses process.argv into typed ParsedArgs.
 * Supports multiple argument formats for convenience.
 *
 * Argument forms supported:
 * - Position: owl "prompt" (mode defaults to standard)
 * - Mode flags: owl --deep "prompt", owl -d "prompt"
 * - Mode option: owl --mode=deep "prompt"
 *
 * @example
 * parseArgs(["--deep", "Analyze this"]) // { mode: "deep", prompt: "Analyze this" }
 * parseArgs(["-q", "quick task"]) // { mode: "quick", prompt: "quick task" }
 * parseArgs([]) // { mode: "standard", prompt: null }
 */
import type { Mode } from "../core/schema/index.js"

/** @Owl.CLI.Args.ValidModes - Supported operating modes */
export const VALID_MODES: readonly string[] = [
  "standard",
  "quick",
  "deep",
  "economy",
  "god",
]

/**
 * @Owl.CLI.Args.Parsed - Output of parseArgs
 */
export interface ParsedArgs {
  /** Operating mode for this session */
  readonly mode: Mode
  /** Initial prompt (null if not provided) */
  readonly prompt: string | null
}

/**
 * Parse an array of CLI tokens into a typed ParsedArgs.
 * Accepts process.argv.slice(2) or any string array for testing.
 *
 * @param argv - Command-line arguments (typically process.argv.slice(2))
 * @returns ParsedArgs with mode and prompt
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
