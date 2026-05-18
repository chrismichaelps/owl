/**
 * @Owl.Commands.Management.Sessions - List known SessionMemory Sessions
 */
import { Chunk, Effect } from "effect"
import type { CommandParseError } from "../../core/errors/index.js"
import type {
  SessionMemoryService,
  SessionSummary,
} from "../../engine/memory/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

const ACTIVE_MARKER = "* "
const INACTIVE_MARKER = "  "
const TURN_LABEL_SINGULAR = "turn"
const TURN_LABEL_PLURAL = "turns"

const formatTurnCount = (count: number): string =>
  String(count) + " " + (count === 1 ? TURN_LABEL_SINGULAR : TURN_LABEL_PLURAL)

const formatSessions = (
  activeSessionId: string,
  summaries: Chunk.Chunk<SessionSummary>,
): string => {
  const visibleSessions = Chunk.isEmpty(summaries)
    ? Chunk.make({ sessionId: activeSessionId, turnCount: 0 })
    : summaries

  return Chunk.toReadonlyArray(
    Chunk.prepend(
      Chunk.map(
        visibleSessions,
        (summary) =>
          (summary.sessionId === activeSessionId
            ? ACTIVE_MARKER
            : INACTIVE_MARKER) +
          summary.sessionId +
          " — " +
          formatTurnCount(summary.turnCount),
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
        const summaries = yield* sessionMemory.listSessionSummaries()
        return { output: formatSessions(activeSessionId, summaries) }
      }),
  }
}
