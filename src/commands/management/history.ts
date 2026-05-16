/**
 * @Owl.Commands.Management.History - Display session turn history: /history
 *
 * Shows the conversation turns from the current session in a readable format:
 * - Turn number, mode, provider, token counts
 * - Truncated prompt/response previews
 *
 * @example
 * /history
 * // Turn 1 [standard] anthropic — 320↑ 84↓
 * //   ❯ Write a hello world function
 * //   ✦ Here is a hello world...
 */
import { Chunk, Effect } from "effect"
import { COMMAND_CONSTANTS } from "../../core/constants/index.js"
import { truncate } from "../../core/utils/format.js"
import { formatEstimatedCostUsd } from "../../core/cost.js"
import type { CommandParseError } from "../../core/errors/index.js"
import type { SessionMemoryService } from "../../engine/memory/index.js"
import { loadHistory } from "../../tui/history/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

type PromptHistoryLoader = (projectRoot: string) => Promise<readonly string[]>

const parseLimit = (
  raw: string | undefined,
  fallback: number,
  max: number,
): number => {
  if (raw === undefined || !/^\d+$/.test(raw)) {
    return fallback
  }
  return Math.min(Number(raw), max)
}

const formatPromptHistory = (
  prompts: readonly string[],
  rawLimit: string | undefined,
): CommandResult => {
  if (prompts.length === 0) {
    return { output: "No prompt history for this project." }
  }

  const limit = parseLimit(rawLimit, prompts.length, prompts.length)
  const selected = Chunk.take(Chunk.fromIterable(prompts), limit)
  const indexed = Chunk.zip(
    selected,
    Chunk.range(0, Math.max(0, Chunk.size(selected) - 1)),
  )
  const lines = Chunk.prepend(
    Chunk.map(indexed, ([prompt, index]) => {
      const n = index + 1
      return (
        "#" +
        String(n) +
        " ❯ " +
        truncate(prompt, COMMAND_CONSTANTS.MEMORY_PREVIEW_LENGTH)
      )
    }),
    "Prompt history — " +
      String(prompts.length) +
      " entr" +
      (prompts.length === 1 ? "y" : "ies"),
  )

  return { output: Chunk.toReadonlyArray(lines).join("\n") }
}

/**
 * @Owl.Commands.Management.History.Factory - Create the /history command handler
 */
export function makeHistoryCommand(
  sessionMemory: SessionMemoryService,
  projectRoot: string,
  loadPromptHistory: PromptHistoryLoader = loadHistory,
): CommandHandler {
  return {
    name: "history",
    description:
      "Display session turns or persistent prompts: /history [n|prompts n]",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> =>
      Effect.gen(function* () {
        if (args[0] === COMMAND_CONSTANTS.HISTORY_PROMPTS_SUBCOMMAND) {
          const prompts = yield* Effect.promise(() =>
            loadPromptHistory(projectRoot),
          )
          return formatPromptHistory(prompts, args[1])
        }

        const turns = yield* sessionMemory.getTurns()

        if (turns.length === 0) {
          return { output: "No turns yet in this session." }
        }

        const limit = parseLimit(args[0], turns.length, turns.length)

        const turnChunk = Chunk.fromIterable(turns)
        const recent = Chunk.takeRight(turnChunk, limit)

        const header = Chunk.make(
          `Session history — ${String(turns.length)} turn${turns.length === 1 ? "" : "s"}`,
          "",
        )
        const startingIndex = turns.length - Chunk.size(recent)
        const indexedRecent = Chunk.zip(
          recent,
          Chunk.range(startingIndex + 1, turns.length),
        )
        const body = Chunk.flatMap(indexedRecent, ([turn, num]) => {
          const tokens = String(turn.tokensUsed) + "tok"
          const cost =
            turn.estimatedCostUsd != null
              ? " " + formatEstimatedCostUsd(turn.estimatedCostUsd)
              : ""
          const provider = turn.provider != null ? " · " + turn.provider : ""

          return Chunk.make(
            "#" + String(num) + provider + " · " + tokens + cost,
            "  ❯ " +
              truncate(turn.prompt, COMMAND_CONSTANTS.MEMORY_PREVIEW_LENGTH),
            "  ✦ " +
              truncate(turn.response, COMMAND_CONSTANTS.MEMORY_PREVIEW_LENGTH),
            "",
          )
        })
        const lines = Chunk.appendAll(header, body)

        return { output: Chunk.toReadonlyArray(lines).join("\n").trimEnd() }
      }),
  }
}
