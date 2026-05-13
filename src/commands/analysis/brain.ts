/** @Owl.Commands.Analysis.Brain - Display hash registry subsystems: /brain */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { HashRegistryService } from "../../fmcf/registry/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

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
