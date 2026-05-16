/**
 * @Owl.Commands.Management.Memory - Display session turn history: /memory
 *
 * Shows all conversation turns in the current session.
 * Each turn shows timestamp, token count, and truncated prompt/response.
 *
 * @example
 * /memory
 * // [1] 2024-01-15T10:30:00Z (1250 tokens)
 * //   Q: Create a function...
 * //   A: Here is your function...
 */
import { Effect } from "effect"
import { truncate } from "../../core/utils/format.js"
import { COMMAND_CONSTANTS } from "../../core/constants/index.js"
import { formatEstimatedCostUsd } from "../../core/cost.js"
import type { CommandParseError } from "../../core/errors/index.js"
import type {
  SessionMemoryService,
  SessionTurn,
} from "../../engine/memory/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

const formatRuntimeMetadata = (turn: SessionTurn): string => {
  const parts = [
    turn.provider,
    turn.model,
    turn.latencyMs === undefined ? undefined : String(turn.latencyMs) + "ms",
    turn.estimatedCostUsd === undefined
      ? undefined
      : formatEstimatedCostUsd(turn.estimatedCostUsd),
  ].filter((part): part is string => part !== undefined && part.length > 0)

  return parts.length === 0 ? "" : " | " + parts.join(" | ")
}

/**
 * @Owl.Commands.Management.Memory.Factory - Create the /memory command handler
 */
export function makeMemoryCommand(
  sessionMemory: SessionMemoryService,
): CommandHandler {
  return {
    name: "memory",
    description: "Display recent session turn history: /memory",
    execute: (_args): Effect.Effect<CommandResult, CommandParseError> =>
      sessionMemory.getTurns().pipe(
        Effect.map((turns) => {
          if (turns.length === 0) {
            return { output: "No session turns recorded." }
          }
          const lines = turns.map(
            (t, i) =>
              "[" +
              String(i + 1) +
              "] " +
              t.timestamp +
              " (" +
              String(t.tokensUsed) +
              " tokens" +
              formatRuntimeMetadata(t) +
              ")\n" +
              "  Q: " +
              truncate(
                t.prompt,
                COMMAND_CONSTANTS.MEMORY_PREVIEW_LENGTH,
                "...",
              ) +
              "\n" +
              "  A: " +
              truncate(
                t.response,
                COMMAND_CONSTANTS.MEMORY_PREVIEW_LENGTH,
                "...",
              ),
          )
          return { output: lines.join("\n\n") }
        }),
      ),
  }
}
