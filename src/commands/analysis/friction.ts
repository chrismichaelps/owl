/** @Owl.Commands.Analysis.Friction - Friction discovery dispatcher: /friction <subject> */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { OrchestratorService } from "../../engine/orchestrator/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

const PREAMBLE =
  "You are an FMCF v3.5 Architect running Friction Discovery. Identify: (1) shallow modules hiding complexity, (2) leaky abstractions, (3) high-coupling seams, (4) over-specified interfaces. For each friction point: name it, score its complexity tax (0.0–1.0), and propose a deepening action. Subject: "

export function makeFrictionCommand(
  orchestrator: OrchestratorService,
): CommandHandler {
  return {
    name: "friction",
    description: "Run FMCF friction discovery: /friction <subject>",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      const subject = args.join(" ").trim()
      if (subject.length === 0) {
        return Effect.fail(
          new CommandParseError({
            input: "/friction",
            reason: "Subject is required",
          }),
        )
      }
      return orchestrator
        .run({
          id: "cmd-" + Date.now().toString(36),
          prompt: PREAMBLE + subject,
          mode: "deep",
          createdAt: new Date().toISOString(),
        })
        .pipe(
          Effect.map((r) => ({ output: r.content })),
          Effect.catchAll((err) =>
            Effect.fail(
              new CommandParseError({
                input: "/friction",
                reason: String(err),
              }),
            ),
          ),
        )
    },
  }
}
