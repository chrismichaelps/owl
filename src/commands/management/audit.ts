/**
 * @Owl.Commands.Management.Audit - FMCF governance audit dispatcher: /audit <subject>
 *
 * Performs a comprehensive governance audit against FMCF v3.5 invariants.
 * Evaluates:
 * - Hash-First Hard-Lock compliance
 * - Specialist-Silo Constraint adherence
 * - Dual-Track Registry integrity
 * - Seam Capacity alignment
 * - DEPTH_SCORE thresholds
 *
 * Reports violations, risks, and recommended remediation.
 *
 * Mode: deep (for thorough evaluation)
 *
 * @example
 * /audit src/engine/
 */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { OrchestratorService } from "../../engine/orchestrator/index.js"
import type { CommandHandler, CommandResult } from "../types.js"
import { makeCommandTaskId } from "../utils/ids.js"

const AUDIT_PREAMBLE =
  "You are an FMCF v3.5 Forensic Guardian performing a governance audit. Evaluate the subject against all FMCF invariants: Hash-First Hard-Lock compliance, Specialist-Silo Constraint adherence, Dual-Track Registry integrity, Seam Capacity alignment, and DEPTH_SCORE thresholds. Report violations, risks, and recommended remediation steps. Subject: "

/**
 * @Owl.Commands.Management.Audit.Factory - Create the /audit command handler
 */
export function makeAuditCommand(
  orchestrator: OrchestratorService,
): CommandHandler {
  return {
    name: "audit",
    description: "Run an FMCF governance audit on a subject: /audit <subject>",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      const subject = args.join(" ").trim()
      if (subject.length === 0) {
        return Effect.fail(
          new CommandParseError({
            input: "/audit",
            reason: "Audit subject is required",
          }),
        )
      }
      return orchestrator
        .run({
          id: makeCommandTaskId("audit", subject),
          prompt: AUDIT_PREAMBLE + subject,
          mode: "deep",
          createdAt: new Date().toISOString(),
        })
        .pipe(
          Effect.map((r) => ({ output: r.content })),
          Effect.catchAll((err) =>
            Effect.fail(
              new CommandParseError({ input: "/audit", reason: String(err) }),
            ),
          ),
        )
    },
  }
}
