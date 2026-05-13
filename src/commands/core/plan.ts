/** @Owl.Commands.Core.Plan - Planning dispatcher: /plan <prompt> — deep mode with architect preamble */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { OrchestratorService } from "../../engine/orchestrator/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

const PLAN_PREAMBLE =
  "You are an FMCF Architect. Produce a step-by-step implementation plan with: tasks, exact file paths, complete code snippets, and test commands. Be specific. Task: "

export function makePlanCommand(
  orchestrator: OrchestratorService,
): CommandHandler {
  return {
    name: "plan",
    description: "Generate an implementation plan in deep mode: /plan <prompt>",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      const prompt = args.join(" ").trim()
      if (prompt.length === 0) {
        return Effect.fail(
          new CommandParseError({
            input: "/plan",
            reason: "Prompt is required",
          }),
        )
      }
      return orchestrator
        .run({
          id: "cmd-" + Date.now().toString(36),
          prompt: PLAN_PREAMBLE + prompt,
          mode: "deep",
          createdAt: new Date().toISOString(),
        })
        .pipe(
          Effect.map((r) => ({ output: r.content })),
          Effect.catchAll((err) =>
            Effect.fail(
              new CommandParseError({ input: "/plan", reason: String(err) }),
            ),
          ),
        )
    },
  }
}
