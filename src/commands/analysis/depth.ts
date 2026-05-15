/**
 * @Owl.Commands.Analysis.Depth - Compute DEPTH_SCORE for a module: /depth <subject>
 *
 * Uses the Orchestrator to compute the DEPTH_SCORE for a subject module.
 * DEPTH_SCORE = (Leverage + Locality + Testability) / 3 - ComplexityTax
 *
 * Classification:
 * - DEEP: >= 0.70
 * - MEDIUM: 0.40-0.69
 * - SHALLOW: < 0.40
 *
 * Mode: standard (balanced reasoning)
 *
 * @example
 * /depth src/engine/orchestrator
 */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { OrchestratorService } from "../../engine/orchestrator/index.js"
import type { CommandHandler, CommandResult } from "../types.js"
import { makeCommandTaskId } from "../utils/ids.js"
import { requireCommandText } from "../utils/prompt.js"

const PREAMBLE =
  "You are an FMCF v3.5 Architect. Compute the DEPTH_SCORE using: (Leverage+Locality+Testability)/3 - ComplexityTax. Each metric is 0.0–1.0. Show your scoring breakdown and final classification (DEEP ≥0.70, SHALLOW <0.40, MEDIUM otherwise). Subject: "

/**
 * @Owl.Commands.Analysis.Depth.Factory - Create the /depth command handler
 */
export function makeDepthCommand(
  orchestrator: OrchestratorService,
): CommandHandler {
  return {
    name: "depth",
    description: "Compute FMCF DEPTH_SCORE for a module: /depth <subject>",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      return requireCommandText("depth", args, "Subject").pipe(
        Effect.flatMap((subject) =>
          orchestrator.run({
            id: makeCommandTaskId("depth", subject),
            prompt: PREAMBLE + subject,
            mode: "standard",
            createdAt: new Date().toISOString(),
          }),
        ),
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
