/**
 * @Owl.Commands.Power.God - God mode (200k context) dispatcher: /god <prompt>
 *
 * Maximum context mode with 200,000 token budget.
 * Use for very complex tasks requiring full codebase context:
 * - Large refactors
 * - Cross-cutting changes
 * - Deep architectural analysis
 *
 * Mode: god (200k tokens)
 *
 * @example
 * /god Refactor the entire auth system to use JWT
 */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { OrchestratorService } from "../../engine/orchestrator/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

/**
 * @Owl.Commands.Power.God.Factory - Create the /god command handler
 */
export function makeGodCommand(
  orchestrator: OrchestratorService,
): CommandHandler {
  return {
    name: "god",
    description: "Run a task with the full 200k context window: /god <prompt>",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      const prompt = args.join(" ").trim()
      if (prompt.length === 0) {
        return Effect.fail(
          new CommandParseError({
            input: "/god",
            reason: "Prompt is required",
          }),
        )
      }
      return orchestrator
        .run({
          id: "cmd-" + Date.now().toString(36),
          prompt,
          mode: "god",
          createdAt: new Date().toISOString(),
        })
        .pipe(
          Effect.map((r) => ({ output: r.content })),
          Effect.catchAll((err) =>
            Effect.fail(
              new CommandParseError({ input: "/god", reason: String(err) }),
            ),
          ),
        )
    },
  }
}
