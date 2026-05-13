/** @Owl.Commands.Editing.Refactor - Refactoring advice dispatcher: /refactor <prompt> */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { OrchestratorService } from "../../engine/orchestrator/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

const PREAMBLE =
  "You are a refactoring expert applying FMCF v3.5 principles. Analyze the subject and produce specific, actionable refactoring steps: exact file paths, old code snippets, and new code snippets. Focus on deepening modules and reducing coupling. Subject: "

export function makeRefactorCommand(
  orchestrator: OrchestratorService,
): CommandHandler {
  return {
    name: "refactor",
    description: "Get refactoring advice for a subject: /refactor <prompt>",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      const prompt = args.join(" ").trim()
      if (prompt.length === 0) {
        return Effect.fail(
          new CommandParseError({
            input: "/refactor",
            reason: "Prompt is required",
          }),
        )
      }
      return orchestrator
        .run({
          id: "cmd-" + Date.now().toString(36),
          prompt: PREAMBLE + prompt,
          mode: "deep",
          createdAt: new Date().toISOString(),
        })
        .pipe(
          Effect.map((r) => ({ output: r.content })),
          Effect.catchAll((err) =>
            Effect.fail(
              new CommandParseError({
                input: "/refactor",
                reason: String(err),
              }),
            ),
          ),
        )
    },
  }
}
