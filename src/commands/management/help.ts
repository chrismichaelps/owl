/** @Owl.Commands.Management.Help - Command registry help surface */
import { Effect } from "effect"
import type { CommandRegistryService } from "../registry.js"
import type { CommandHandler, CommandResult } from "../types.js"

const formatCommand = (command: {
  readonly name: string
  readonly description: string
}): string => "/" + command.name + " - " + command.description

interface ListedCommand {
  readonly name: string
  readonly description: string
}

/** @Owl.Commands.Management.Help.Factory - Create /help command handler */
export function makeHelpCommand(
  registry: CommandRegistryService,
): CommandHandler {
  return {
    name: "help",
    description: "List available slash commands: /help",
    execute: (): Effect.Effect<CommandResult> =>
      registry.list().pipe(
        Effect.map((commands) => {
          const sorted: ListedCommand[] = Array.from(commands).sort((a, b) =>
            a.name.localeCompare(b.name),
          )
          const output = sorted.map(formatCommand).join("\n")
          return {
            output: output.length > 0 ? output : "No commands registered",
          } satisfies CommandResult
        }),
      ),
  }
}
