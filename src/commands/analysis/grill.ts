/** @Owl.Commands.Analysis.Grill - Grilling loop dispatcher: /grill <subject> */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { OrchestratorService } from "../../engine/orchestrator/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

const PREAMBLE =
  "You are an FMCF v3.5 Architect running the Grilling Loop. Challenge every assumption about the proposed design. Ask: Does this survive the Deletion Test? Is this the simplest seam? Would removing this module break anything essential? Could this boundary be collapsed? Generate 5–7 probing questions and answer each with an honest architectural assessment. Subject: "

export function makeGrillCommand(
  orchestrator: OrchestratorService,
): CommandHandler {
  return {
    name: "grill",
    description:
      "Run FMCF grilling loop to challenge design assumptions: /grill <subject>",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      const subject = args.join(" ").trim()
      if (subject.length === 0) {
        return Effect.fail(
          new CommandParseError({
            input: "/grill",
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
              new CommandParseError({ input: "/grill", reason: String(err) }),
            ),
          ),
        )
    },
  }
}
