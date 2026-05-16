/** @Owl.Commands.Management.Help - Command registry help surface */
import { Chunk, Effect, Order } from "effect"
import type { CommandRegistryService } from "../registry.js"
import type { CommandHandler, CommandResult } from "../types.js"

const formatCommand = (command: {
  readonly name: string
  readonly description: string
}): string => "/" + command.name + " - " + command.description

const commandOrder = Order.mapInput(
  Order.string,
  (command: { readonly name: string }) => command.name,
)

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
          const output = Chunk.toReadonlyArray(
            Chunk.map(
              Chunk.sort(Chunk.fromIterable(commands), commandOrder),
              formatCommand,
            ),
          ).join("\n")
          return {
            output: output.length > 0 ? output : "No commands registered",
          } satisfies CommandResult
        }),
      ),
  }
}
