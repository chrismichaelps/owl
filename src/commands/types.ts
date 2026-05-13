/** @Owl.Commands.Types - Shared interfaces for the command pipeline */
import type { Effect } from "effect"
import type { CommandParseError } from "../core/errors/index.js"

/** @Owl.Commands.Types.Parsed - Output of parseCommand() */
export interface ParsedCommand {
  readonly name: string
  readonly args: readonly string[]
  readonly raw: string
}

/** @Owl.Commands.Types.Result - Successful command output */
export interface CommandResult {
  readonly output: string
}

/** @Owl.Commands.Types.Handler - Interface every command must satisfy */
export interface CommandHandler {
  readonly name: string
  readonly description: string
  readonly execute: (
    args: readonly string[],
  ) => Effect.Effect<CommandResult, CommandParseError>
}
