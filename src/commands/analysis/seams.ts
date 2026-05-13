/** @Owl.Commands.Analysis.Seams - Display hash registry seams: /seams */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { HashRegistryService } from "../../fmcf/registry/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

export function makeSeamsCommand(
  registry: HashRegistryService,
): CommandHandler {
  return {
    name: "seams",
    description: "Display all seams from the hash registry: /seams",
    execute: (_args): Effect.Effect<CommandResult, CommandParseError> =>
      registry.readSeams().pipe(
        Effect.map((seams) => {
          const lines = seams.map(
            (s) => s.id + " [" + s.capacity + "] — " + s.name,
          )
          return { output: lines.join("\n") }
        }),
        Effect.catchAll((err) =>
          Effect.fail(
            new CommandParseError({ input: "/seams", reason: String(err) }),
          ),
        ),
      ),
  }
}
