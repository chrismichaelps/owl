/**
 * @Owl.Commands.Core.Task - Standard inference dispatcher: /task <prompt>
 *
 * Basic task execution in standard mode (32k token budget).
 * The simplest way to run inference.
 *
 * Mode: standard (32k tokens)
 *
 * @example
 * /task Create a function that adds two numbers
 */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { OrchestratorService } from "../../engine/orchestrator/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

/**
 * @Owl.Commands.Core.Task.Factory - Create the /task command handler
 */
export function makeTaskCommand(
  orchestrator: OrchestratorService,
): CommandHandler {
  return {
    name: "task",
    description: "Run a task in standard mode: /task <prompt>",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      const prompt = args.join(" ").trim()
      if (prompt.length === 0) {
        return Effect.fail(
          new CommandParseError({
            input: "/task",
            reason: "Prompt is required",
          }),
        )
      }
      return orchestrator
        .run({
          id: "cmd-" + Date.now().toString(36),
          prompt,
          mode: "standard",
          createdAt: new Date().toISOString(),
        })
        .pipe(
          Effect.map((r) => ({ output: r.content })),
          Effect.catchAll((err) =>
            Effect.fail(
              new CommandParseError({ input: "/task", reason: String(err) }),
            ),
          ),
        )
    },
  }
}
