/** @Owl.Commands.Analysis.Depth - Compute DEPTH_SCORE for a module: /depth <subject> */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { OrchestratorService } from "../../engine/orchestrator/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

const PREAMBLE =
  "You are an FMCF v3.5 Architect. Compute the DEPTH_SCORE using: (Leverage+Locality+Testability)/3 - ComplexityTax. Each metric is 0.0–1.0. Show your scoring breakdown and final classification (DEEP ≥0.70, SHALLOW <0.40, MEDIUM otherwise). Subject: "

export function makeDepthCommand(
  orchestrator: OrchestratorService,
): CommandHandler {
  return {
    name: "depth",
    description: "Compute FMCF DEPTH_SCORE for a module: /depth <subject>",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      const subject = args.join(" ").trim()
      if (subject.length === 0) {
        return Effect.fail(
          new CommandParseError({
            input: "/depth",
            reason: "Subject is required",
          }),
        )
      }
      return orchestrator
        .run({
          id: "cmd-" + Date.now().toString(36),
          prompt: PREAMBLE + subject,
          mode: "standard",
          createdAt: new Date().toISOString(),
        })
        .pipe(
          Effect.map((r) => ({ output: r.content })),
          Effect.catchAll((err) =>
            Effect.fail(
              new CommandParseError({ input: "/depth", reason: String(err) }),
            ),
          ),
        )
    },
  }
}
