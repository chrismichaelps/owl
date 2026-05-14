/**
 * @Owl.Commands.Types - Shared interfaces for the command pipeline
 *
 * Command system architecture:
 * - Commands are slash-prefixed strings parsed by parseCommand()
 * - Each command has a handler (CommandHandler) that executes it
 * - Handlers are registered with CommandRegistry
 * - Dispatch maps ParsedCommand → CommandResult
 *
 * Command pipeline:
 * 1. User input: "/edit src/foo.ts "old" "new""
 * 2. parseCommand() → ParsedCommand { name: "edit", args: ["src/foo.ts", "old", "new"] }
 * 3. CommandRegistry.lookup("edit") → CommandHandler
 * 4. CommandHandler.execute(args) → CommandResult { output: "..." }
 * 5. TUI displays result
 */
import type { Effect } from "effect"
import type { CommandParseError } from "../core/errors/index.js"

/**
 * @Owl.Commands.Types.Parsed - Output of parseCommand()
 *
 * @example
 * // "/edit src/foo.ts \"old\" \"new\""
 * const parsed: ParsedCommand = {
 *   name: "edit",
 *   args: ["src/foo.ts", "old", "new"],
 *   raw: "/edit src/foo.ts \"old\" \"new\"",
 * }
 */
export interface ParsedCommand {
  readonly name: string
  readonly args: readonly string[]
  readonly raw: string
}

/**
 * @Owl.Commands.Types.Result - Successful command output
 *
 * All successful command executions return this shape.
 * The output string is displayed in the TUI.
 */
export interface CommandResult {
  readonly output: string
}

/**
 * @Owl.Commands.Types.Handler - Interface every command must satisfy
 *
 * Commands are factory functions that create CommandHandler instances.
 * The handler encapsulates the command name, description, and execution logic.
 *
 * @example
 * const handler: CommandHandler = {
 *   name: "edit",
 *   description: "Apply a surgical string replacement: /edit <file> \"<old>\" \"<new>\"",
 *   execute: (args) => Effect.succeed({ output: "Edited file..." }),
 * }
 */
export interface CommandHandler {
  /** Slash command name, e.g., "edit", "deep", "analyze" */
  readonly name: string
  /** Human-readable description for /help */
  readonly description: string
  /** Execute the command with parsed args */
  readonly execute: (
    args: readonly string[],
  ) => Effect.Effect<CommandResult, CommandParseError>
}
