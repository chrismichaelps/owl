/**
 * @Owl.Commands.Power.Raw - Raw standard mode inference: /raw <prompt>
 *
 * Runs inference with NO preamble — just the user's prompt as-is.
 * Unlike /task which may add context, /raw passes the exact prompt.
 *
 * Use when you want complete control over the prompt.
 *
 * Mode: standard (32k tokens)
 *
 * @example
 * /raw What is 2 + 2? (no context, no preamble)
 */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { OrchestratorService } from "../../engine/orchestrator/index.js"
import type { CommandHandler, CommandResult } from "../types.js"
import { makeCommandTaskId } from "../utils/ids.js"

/**
 * @Owl.Commands.Power.Raw.Factory - Create the /raw command handler
 */
export function makeRawCommand(
  orchestrator: OrchestratorService,
): CommandHandler {
  return {
    name: "raw",
    description: "Run a raw inference task with no preamble: /raw <prompt>",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      const prompt = args.join(" ").trim()
      if (prompt.length === 0) {
        return Effect.fail(
          new CommandParseError({
            input: "/raw",
            reason: "Prompt is required",
          }),
        )
      }
      return orchestrator
        .run({
          id: makeCommandTaskId("raw", prompt),
          prompt,
          mode: "standard",
          createdAt: new Date().toISOString(),
        })
        .pipe(
          Effect.map((r) => ({ output: r.content })),
          Effect.catchAll((err) =>
            Effect.fail(
              new CommandParseError({ input: "/raw", reason: String(err) }),
            ),
          ),
        )
    },
  }
}
