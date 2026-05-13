/** @Owl.Commands.Management.Audit - FMCF governance audit dispatcher: /audit <subject> */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { OrchestratorService } from "../../engine/orchestrator/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

const AUDIT_PREAMBLE =
  "You are an FMCF v3.5 Forensic Guardian performing a governance audit. Evaluate the subject against all FMCF invariants: Hash-First Hard-Lock compliance, Specialist-Silo Constraint adherence, Dual-Track Registry integrity, Seam Capacity alignment, and DEPTH_SCORE thresholds. Report violations, risks, and recommended remediation steps. Subject: "

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
          id: "cmd-" + Date.now().toString(36),
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
