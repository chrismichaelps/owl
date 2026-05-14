/**
 * @Owl.Commands.Management.Registry - Display full registry summary: /registry
 *
 * Shows both subsystems and seams from the hash registry.
 *
 * @example
 * /registry
 * // Subsystems (5):
 * //   subsystem-engine — Orchestration Engine (3 modules)
 * //
 * // Seams (8):
 * //   seam-orchestrator-router [BACKBONE] — Orchestrator-Router Crossing Point
 */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { HashRegistryService } from "../../fmcf/registry/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

/**
 * @Owl.Commands.Management.Registry.Factory - Create the /registry command handler
 */
export function makeRegistryCommand(
  hashRegistry: HashRegistryService,
): CommandHandler {
  return {
    name: "registry",
    description:
      "Display full hash registry summary (subsystems + seams): /registry",
    execute: (_args): Effect.Effect<CommandResult, CommandParseError> =>
      Effect.all([
        hashRegistry.readSubsystems(),
        hashRegistry.readSeams(),
      ]).pipe(
        Effect.map(([subsystems, seams]) => {
          const subsystemLines = subsystems.map(
            (s) =>
              "  " +
              s.id +
              " — " +
              s.name +
              " (" +
              String(s.modules.length) +
              " modules)",
          )
          const seamLines = seams.map(
            (s) => "  " + s.id + " [" + s.capacity + "] — " + s.name,
          )
          const output =
            "Subsystems (" +
            String(subsystems.length) +
            "):\n" +
            subsystemLines.join("\n") +
            "\n\nSeams (" +
            String(seams.length) +
            "):\n" +
            seamLines.join("\n")
          return { output }
        }),
        Effect.catchAll((err) =>
          Effect.fail(
            new CommandParseError({ input: "/registry", reason: String(err) }),
          ),
        ),
      ),
  }
}
