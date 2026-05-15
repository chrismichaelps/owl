/**
 * @Owl.Commands.Analysis.Friction - Friction discovery dispatcher: /friction <subject>
 *
 * Uses the Orchestrator to run Friction Discovery — identifying:
 * - Shallow modules hiding complexity
 * - Leaky abstractions
 * - High-coupling seams
 * - Over-specified interfaces
 *
 * Each friction point is scored (0.0-1.0 complexity tax) with a deepening action.
 *
 * Mode: deep (for thorough analysis)
 *
 * @example
 * /friction src/editor/
 */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { OrchestratorService } from "../../engine/orchestrator/index.js"
import type { CommandHandler, CommandResult } from "../types.js"
import { makeCommandTaskId } from "../utils/ids.js"
import { requireCommandText } from "../utils/prompt.js"

const PREAMBLE =
  "You are an FMCF v3.5 Architect running Friction Discovery. Identify: (1) shallow modules hiding complexity, (2) leaky abstractions, (3) high-coupling seams, (4) over-specified interfaces. For each friction point: name it, score its complexity tax (0.0–1.0), and propose a deepening action. Subject: "

/**
 * @Owl.Commands.Analysis.Friction.Factory - Create the /friction command handler
 */
export function makeFrictionCommand(
  orchestrator: OrchestratorService,
): CommandHandler {
  return {
    name: "friction",
    description: "Run FMCF friction discovery: /friction <subject>",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      return requireCommandText("friction", args, "Subject").pipe(
        Effect.flatMap((subject) =>
          orchestrator.run({
            id: makeCommandTaskId("friction", subject),
            prompt: PREAMBLE + subject,
            mode: "deep",
            createdAt: new Date().toISOString(),
          }),
        ),
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
