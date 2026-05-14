/**
 * @Owl.Commands.Core.Deep - Deep mode inference dispatcher: /deep <prompt>
 *
 * Task execution in deep mode (100k token budget) with enhanced reasoning.
 * Use for complex analysis, refactoring, or multi-step tasks.
 *
 * Mode: deep (100k tokens, reasoning-intensive)
 *
 * @example
 * /deep Refactor the authentication module to use a cleaner pattern
 */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { OrchestratorService } from "../../engine/orchestrator/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

/**
 * @Owl.Commands.Core.Deep.Factory - Create the /deep command handler
 */
export function makeDeepCommand(
  orchestrator: OrchestratorService,
): CommandHandler {
  return {
    name: "deep",
    description: "Run a task in deep analysis mode: /deep <prompt>",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      const prompt = args.join(" ").trim()
      if (prompt.length === 0) {
        return Effect.fail(
          new CommandParseError({
            input: "/deep",
            reason: "Prompt is required",
          }),
        )
      }
      return orchestrator
        .run({
          id: "cmd-" + Date.now().toString(36),
          prompt,
          mode: "deep",
          createdAt: new Date().toISOString(),
        })
        .pipe(
          Effect.map((r) => ({ output: r.content })),
          Effect.catchAll((err) =>
            Effect.fail(
              new CommandParseError({ input: "/deep", reason: String(err) }),
            ),
          ),
        )
    },
  }
}
