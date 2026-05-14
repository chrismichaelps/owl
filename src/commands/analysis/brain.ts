/**
 * @Owl.Commands.Analysis.Brain - Display hash registry subsystems: /brain
 *
 * Reads from the HashRegistry to display all subsystems in the /hashes/ brain.
 * Shows subsystem ID, name, module count, and invariant count.
 *
 * @example
 * /brain
 * // subsystem-engine — Orchestration Engine (3 modules, 2 invariants)
 * // subsystem-editor — Mutation Pipeline (4 modules, 1 invariants)
 */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { HashRegistryService } from "../../fmcf/registry/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

/**
 * @Owl.Commands.Analysis.Brain.Factory - Create the /brain command handler
 */
export function makeBrainCommand(
  registry: HashRegistryService,
): CommandHandler {
  return {
    name: "brain",
    description: "Display all subsystems from the hash registry: /brain",
    execute: (_args): Effect.Effect<CommandResult, CommandParseError> =>
      registry.readSubsystems().pipe(
        Effect.map((subsystems) => {
          const lines = subsystems.map(
            (s) =>
              s.id +
              " — " +
              s.name +
              " (" +
              String(s.modules.length) +
              " modules, " +
              String(s.invariants.length) +
              " invariants)",
          )
          return { output: lines.join("\n") }
        }),
        Effect.catchAll((err) =>
          Effect.fail(
            new CommandParseError({ input: "/brain", reason: String(err) }),
          ),
        ),
      ),
  }
}
