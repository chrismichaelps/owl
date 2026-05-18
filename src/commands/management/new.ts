/**
 * @Owl.Commands.Management.NewSession - Create active SessionMemory Session
 */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { SessionMemoryService } from "../../engine/memory/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

const toCommandParseError = (
  input: string,
  error: unknown,
): CommandParseError =>
  new CommandParseError({
    input,
    reason: String(error),
  })

/** @Owl.Commands.Management.NewSession.Factory - Create the /new command handler */
export function makeNewCommand(
  sessionMemory: SessionMemoryService,
): CommandHandler {
  return {
    name: "new",
    description: "Start a fresh active Session: /new [sessionId]",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      const sessionId = args[0]
      const input = sessionId === undefined ? "/new" : "/new " + sessionId

      return sessionMemory.startSession(sessionId).pipe(
        Effect.map((activeSessionId) => ({
          output: "New Session: " + activeSessionId,
        })),
        Effect.mapError((error) => toCommandParseError(input, error)),
      )
    },
  }
}
