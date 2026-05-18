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
 * - Permission option: owl --permission-mode=plan, owl --dangerously-skip-permissions
 * - Metadata: owl --help, owl --version
 *
 * @example
 * parseArgs(["--deep", "Analyze this"]) // { mode: "deep", prompt: "Analyze this" }
 * parseArgs(["-q", "quick task"]) // { mode: "quick", prompt: "quick task" }
 * parseArgs([]) // { mode: "standard", prompt: null }
 */
import type { Mode } from "../core/schema/index.js"
import { Chunk, HashSet, Option } from "effect"
import {
  CLI_FLAGS,
  CLI_FLAG_SETS,
  MODE_IDS,
  MODE_ID_SET,
  MODES,
  TOOL_PERMISSION_MODES,
} from "../core/constants/index.js"
import { parseToolPermissionMode } from "../tools/index.js"
import type { ToolPermissionMode } from "../tools/index.js"

/** @Owl.CLI.Args.ValidModes - Supported operating modes */
export const VALID_MODES: readonly string[] = Chunk.toReadonlyArray(MODE_IDS)

/** @Owl.CLI.Args.ValidModeGuard - Validate mode literals */
export const isValidMode = (value: string): value is Mode =>
  HashSet.has(MODE_ID_SET, value)

/**
 * @Owl.CLI.Args.Parsed - Output of parseArgs
 */
export interface ParsedArgs {
  /** Operating mode for this session */
  readonly mode: Mode
  /** Initial prompt (null if not provided) */
  readonly prompt: string | null
  /** Initial tool Permission mode for this session */
  readonly permissionMode: ToolPermissionMode
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
  let permissionMode: ToolPermissionMode = TOOL_PERMISSION_MODES.DEFAULT
  let help = false
  let version = false

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]
    if (arg === undefined) continue

    if (arg.startsWith(CLI_FLAGS.MODE_PREFIX)) {
      const val = arg.slice(CLI_FLAGS.MODE_PREFIX.length)
      if (isValidMode(val)) mode = val
    } else if (arg === CLI_FLAGS.DANGEROUSLY_SKIP_PERMISSIONS) {
      permissionMode = TOOL_PERMISSION_MODES.BYPASS_PERMISSIONS
    } else if (arg === CLI_FLAGS.PERMISSION_MODE) {
      const val = argv[index + 1]
      if (val !== undefined) {
        const parsed = parseToolPermissionMode(val)
        if (Option.isSome(parsed)) {
          permissionMode = parsed.value
          index++
        }
      }
    } else if (arg.startsWith(CLI_FLAGS.PERMISSION_MODE_PREFIX)) {
      const val = arg.slice(CLI_FLAGS.PERMISSION_MODE_PREFIX.length)
      const parsed = parseToolPermissionMode(val)
      if (Option.isSome(parsed)) permissionMode = parsed.value
    } else if (HashSet.has(CLI_FLAG_SETS.HELP, arg)) {
      help = true
    } else if (HashSet.has(CLI_FLAG_SETS.VERSION, arg)) {
      version = true
    } else if (HashSet.has(CLI_FLAG_SETS.QUICK, arg)) {
      mode = MODES.QUICK
    } else if (HashSet.has(CLI_FLAG_SETS.DEEP, arg)) {
      mode = MODES.DEEP
    } else if (HashSet.has(CLI_FLAG_SETS.ECONOMY, arg)) {
      mode = MODES.ECONOMY
    } else if (!arg.startsWith("-")) {
      prompt ??= arg
    }
  }

  return { mode, prompt, permissionMode, help, version }
}
