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
import { makeCommandTaskId } from "../utils/ids.js"
import { requireCommandText } from "../utils/prompt.js"

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
      return requireCommandText("deep", args, "Prompt").pipe(
        Effect.flatMap((prompt) =>
          orchestrator.run({
            id: makeCommandTaskId("deep", prompt),
            prompt,
            mode: "deep",
            createdAt: new Date().toISOString(),
          }),
        ),
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
