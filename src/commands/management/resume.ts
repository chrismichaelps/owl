/**
 * @Owl.Commands.Management.Resume - Switch active SessionMemory Session
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

/** @Owl.Commands.Management.Resume.Factory - Create the /resume command handler */
export function makeResumeCommand(
  sessionMemory: SessionMemoryService,
): CommandHandler {
  return {
    name: "resume",
    description: "Resume or inspect the active Session: /resume [sessionId]",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      const sessionId = args[0]
      const input = sessionId === undefined ? "/resume" : "/resume " + sessionId

      return (
        sessionId === undefined
          ? sessionMemory.getSessionId()
          : sessionMemory.resumeSession(sessionId)
      ).pipe(
        Effect.map((activeSessionId) => ({
          output: "Active Session: " + activeSessionId,
        })),
        Effect.mapError((error) => toCommandParseError(input, error)),
      )
    },
  }
}
