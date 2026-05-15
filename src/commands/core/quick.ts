/**
 * @Owl.Commands.Core.Quick - Quick mode inference dispatcher: /quick <prompt>
 *
 * Fast task execution with minimal token budget (8k).
 * Use for simple, quick tasks where speed matters more than depth.
 *
 * Mode: quick (8k tokens)
 *
 * @example
 * /quick What does this error mean?
 */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { OrchestratorService } from "../../engine/orchestrator/index.js"
import type { CommandHandler, CommandResult } from "../types.js"
import { makeCommandTaskId } from "../utils/ids.js"
import { requireCommandText } from "../utils/prompt.js"

/**
 * @Owl.Commands.Core.Quick.Factory - Create the /quick command handler
 */
export function makeQuickCommand(
  orchestrator: OrchestratorService,
): CommandHandler {
  return {
    name: "quick",
    description: "Run a task in quick mode: /quick <prompt>",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      return requireCommandText("quick", args, "Prompt").pipe(
        Effect.flatMap((prompt) =>
          orchestrator.run({
            id: makeCommandTaskId("quick", prompt),
            prompt,
            mode: "quick",
            createdAt: new Date().toISOString(),
          }),
        ),
        Effect.map((r) => ({ output: r.content })),
        Effect.catchAll((err) =>
          Effect.fail(
            new CommandParseError({ input: "/quick", reason: String(err) }),
          ),
        ),
      )
    },
  }
}
