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
import { Effect } from "effect"
import type { CommandParseError } from "../../core/errors/index.js"
import type { SessionMemoryService } from "../../engine/memory/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

const PREVIEW_CHARS = 80

function truncate(s: string, max: number): string {
  const single = s.replace(/\n/g, " ").trim()
  return single.length <= max ? single : single.slice(0, max - 1) + "…"
}

/**
 * @Owl.Commands.Management.History.Factory - Create the /history command handler
 */
export function makeHistoryCommand(
  sessionMemory: SessionMemoryService,
): CommandHandler {
  return {
    name: "history",
    description: "Display session turn history: /history [n]",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> =>
      Effect.gen(function* () {
        const turns = yield* sessionMemory.getTurns()

        if (turns.length === 0) {
          return { output: "No turns yet in this session." }
        }

        const limit =
          args.length > 0 && /^\d+$/.test(args[0] ?? "")
            ? Math.min(parseInt(args[0] ?? "10", 10), turns.length)
            : turns.length

        const recent = turns.slice(-limit)

        const lines: string[] = [
          `Session history — ${String(turns.length)} turn${turns.length === 1 ? "" : "s"}`,
          "",
        ]

        recent.forEach((turn, i) => {
          const num = turns.length - recent.length + i + 1
          const tokens = `${String(turn.tokensUsed)}tok`
          const cost =
            turn.estimatedCostUsd != null
              ? ` $${turn.estimatedCostUsd.toFixed(4)}`
              : ""
          const provider = turn.provider != null ? ` · ${turn.provider}` : ""

          lines.push(`#${String(num)}${provider} · ${tokens}${cost}`)
          lines.push(`  ❯ ${truncate(turn.prompt, PREVIEW_CHARS)}`)
          lines.push(`  ✦ ${truncate(turn.response, PREVIEW_CHARS)}`)
          lines.push("")
        })

        return { output: lines.join("\n").trimEnd() }
      }),
  }
}
