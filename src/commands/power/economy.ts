/** @Owl.Commands.Power.Economy - Economy mode (2k token budget) dispatcher: /economy <prompt> */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { OrchestratorService } from "../../engine/orchestrator/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

export function makeEconomyCommand(
  orchestrator: OrchestratorService,
): CommandHandler {
  return {
    name: "economy",
    description:
      "Run a task in economy mode (2k token budget): /economy <prompt>",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      const prompt = args.join(" ").trim()
      if (prompt.length === 0) {
        return Effect.fail(
          new CommandParseError({
            input: "/economy",
            reason: "Prompt is required",
          }),
        )
      }
      return orchestrator
        .run({
          id: "cmd-" + Date.now().toString(36),
          prompt,
          mode: "economy",
          createdAt: new Date().toISOString(),
        })
        .pipe(
          Effect.map((r) => ({ output: r.content })),
          Effect.catchAll((err) =>
            Effect.fail(
              new CommandParseError({ input: "/economy", reason: String(err) }),
            ),
          ),
        )
    },
  }
}
