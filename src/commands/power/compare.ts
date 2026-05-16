/**
 * @Owl.Commands.Power.Compare - Parallel provider comparison: /compare <prompt>
 *
 * Runs the same prompt through ranked providers concurrently so users can
 * compare provider behavior without leaving the governed Owl runtime.
 */
import { Chunk, Effect } from "effect"
import { COMMAND_CONSTANTS } from "../../core/constants/index.js"
import { CommandParseError } from "../../core/errors/index.js"
import type { InferenceResponse } from "../../core/schema/index.js"
import type { OrchestratorService } from "../../engine/orchestrator/index.js"
import type { CommandHandler, CommandResult } from "../types.js"
import { makeCommandTaskId } from "../utils/ids.js"
import { requireCommandText } from "../utils/prompt.js"

/** @Owl.Commands.Power.Compare.Format - Render parallel responses */
export function formatCompareOutput(
  responses: readonly InferenceResponse[],
): string {
  return Chunk.toReadonlyArray(
    Chunk.map(
      Chunk.fromIterable(responses),
      (response) =>
        "## " +
        response.provider +
        "/" +
        response.model +
        "\n\n" +
        response.content,
    ),
  ).join(COMMAND_CONSTANTS.COMPARE_RESPONSE_SEPARATOR)
}

/** @Owl.Commands.Power.Compare.Factory - Create the /compare command handler */
export function makeCompareCommand(
  orchestrator: OrchestratorService,
): CommandHandler {
  return {
    name: "compare",
    description:
      "Run ranked providers in parallel for comparison: /compare <prompt>",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      return requireCommandText("compare", args, "Prompt").pipe(
        Effect.flatMap((prompt) =>
          orchestrator.runParallel({
            id: makeCommandTaskId("compare", prompt),
            prompt,
            mode: "standard",
            createdAt: new Date().toISOString(),
          }),
        ),
        Effect.map((responses) => ({ output: formatCompareOutput(responses) })),
        Effect.catchAll((err) =>
          Effect.fail(
            new CommandParseError({ input: "/compare", reason: String(err) }),
          ),
        ),
      )
    },
  }
}
