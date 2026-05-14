/**
 * @Owl.Commands.Analysis.Analyze - FMCF deep architectural analysis dispatcher: /analyze <subject>
 *
 * Uses the Orchestrator to run a deep mode analysis task.
 * The task preamble instructs the LLM to act as an FMCF Architect performing:
 * - Full seam analysis
 * - Friction discovery
 * - DEPTH_SCORE computation and classification
 * - Coupling risk identification
 * - Deepening recommendations
 *
 * Mode: deep (uses deep reasoning, full token budget)
 *
 * @example
 * /analyze src/core/registry
 */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { OrchestratorService } from "../../engine/orchestrator/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

const PREAMBLE =
  "You are an FMCF v3.5 Architect. Perform a full seam analysis and friction discovery. Apply the DEPTH_SCORE formula: (Leverage+Locality+Testability)/3 - ComplexityTax. Report: DEEP/MEDIUM/SHALLOW classification, top coupling risks, and 3 deepening recommendations. Subject: "

/**
 * @Owl.Commands.Analysis.Analyze.Factory - Create the /analyze command handler
 */
export function makeAnalyzeCommand(
  orchestrator: OrchestratorService,
): CommandHandler {
  return {
    name: "analyze",
    description: "Run FMCF deep architectural analysis: /analyze <subject>",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      const subject = args.join(" ").trim()
      if (subject.length === 0) {
        return Effect.fail(
          new CommandParseError({
            input: "/analyze",
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
              new CommandParseError({ input: "/analyze", reason: String(err) }),
            ),
          ),
        )
    },
  }
}
