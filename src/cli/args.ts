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
 * - Metadata: owl --help, owl --version
 *
 * @example
 * parseArgs(["--deep", "Analyze this"]) // { mode: "deep", prompt: "Analyze this" }
 * parseArgs(["-q", "quick task"]) // { mode: "quick", prompt: "quick task" }
 * parseArgs([]) // { mode: "standard", prompt: null }
 */
import type { Mode } from "../core/schema/index.js"
import { CLI_FLAGS, MODES } from "../core/constants/index.js"

/** @Owl.CLI.Args.ValidModes - Supported operating modes */
export const VALID_MODES: readonly string[] = Object.values(MODES)

/**
 * @Owl.CLI.Args.Parsed - Output of parseArgs
 */
export interface ParsedArgs {
  /** Operating mode for this session */
  readonly mode: Mode
  /** Initial prompt (null if not provided) */
  readonly prompt: string | null
  /** Print help and exit before runtime boot */
  readonly help: boolean
  /** Print version and exit before runtime boot */
  readonly version: boolean
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
  let help = false
  let version = false

  for (const arg of argv) {
    if (arg.startsWith(CLI_FLAGS.MODE_PREFIX)) {
      const val = arg.slice(CLI_FLAGS.MODE_PREFIX.length)
      if (VALID_MODES.includes(val)) mode = val as Mode
    } else if ((CLI_FLAGS.HELP as readonly string[]).includes(arg)) {
      help = true
    } else if ((CLI_FLAGS.VERSION as readonly string[]).includes(arg)) {
      version = true
    } else if ((CLI_FLAGS.QUICK as readonly string[]).includes(arg)) {
      mode = MODES.QUICK
    } else if ((CLI_FLAGS.DEEP as readonly string[]).includes(arg)) {
      mode = MODES.DEEP
    } else if ((CLI_FLAGS.ECONOMY as readonly string[]).includes(arg)) {
      mode = MODES.ECONOMY
    } else if (!arg.startsWith("-")) {
      prompt ??= arg
    }
  }

  return { mode, prompt, help, version }
}
