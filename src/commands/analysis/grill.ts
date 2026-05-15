/**
 * @Owl.Commands.Analysis.Grill - Grilling loop dispatcher: /grill <subject>
 *
 * Uses the Orchestrator to challenge every assumption about a proposed design.
 * The Grilling Loop asks:
 * - Does this survive the Deletion Test?
 * - Is this the simplest seam?
 * - Would removing this module break anything essential?
 * - Could this boundary be collapsed?
 *
 * Generates 5-7 probing questions with honest architectural assessments.
 *
 * Mode: deep (for rigorous challenge)
 *
 * @example
 * /grill The proposed layered architecture for the editor
 */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { OrchestratorService } from "../../engine/orchestrator/index.js"
import type { CommandHandler, CommandResult } from "../types.js"
import { makeCommandTaskId } from "../utils/ids.js"

const PREAMBLE =
  "You are an FMCF v3.5 Architect running the Grilling Loop. Challenge every assumption about the proposed design. Ask: Does this survive the Deletion Test? Is this the simplest seam? Would removing this module break anything essential? Could this boundary be collapsed? Generate 5–7 probing questions and answer each with an honest architectural assessment. Subject: "

/**
 * @Owl.Commands.Analysis.Grill.Factory - Create the /grill command handler
 */
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
          id: makeCommandTaskId("grill", subject),
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
