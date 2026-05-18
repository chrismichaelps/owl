/**
 * @Owl.Commands.Management.Sessions - List known SessionMemory Sessions
 */
import { Chunk, Effect } from "effect"
import type { CommandParseError } from "../../core/errors/index.js"
import type { SessionMemoryService } from "../../engine/memory/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

const ACTIVE_MARKER = "* "
const INACTIVE_MARKER = "  "

const formatSessions = (
  activeSessionId: string,
  sessions: Chunk.Chunk<string>,
): string => {
  const visibleSessions = Chunk.isEmpty(sessions)
    ? Chunk.make(activeSessionId)
    : sessions

  return Chunk.toReadonlyArray(
    Chunk.prepend(
      Chunk.map(
        visibleSessions,
        (sessionId) =>
          (sessionId === activeSessionId ? ACTIVE_MARKER : INACTIVE_MARKER) +
          sessionId,
      ),
      "Sessions:",
    ),
  ).join("\n")
}

/** @Owl.Commands.Management.Sessions.Factory - Create the /sessions command handler */
export function makeSessionsCommand(
  sessionMemory: SessionMemoryService,
): CommandHandler {
  return {
    name: "sessions",
    description: "List known Sessions and mark the active one: /sessions",
    execute: (_args): Effect.Effect<CommandResult, CommandParseError> =>
      Effect.gen(function* () {
        const activeSessionId = yield* sessionMemory.getSessionId()
        const sessions = yield* sessionMemory.listSessions()
        return { output: formatSessions(activeSessionId, sessions) }
      }),
  }
}
