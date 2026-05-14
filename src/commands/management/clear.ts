/**
 * @Owl.Commands.Management.Clear - Clear the active context window: /clear
 *
 * Clears all messages from the context window.
 * Useful when you want to start a fresh conversation without losing session history.
 *
 * System prompt is preserved.
 */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { ContextManagerService } from "../../engine/context/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

/**
 * @Owl.Commands.Management.Clear.Factory - Create the /clear command handler
 */
export function makeClearCommand(
  contextManager: ContextManagerService,
): CommandHandler {
  return {
    name: "clear",
    description: "Clear the active context window: /clear",
    execute: (_args): Effect.Effect<CommandResult, CommandParseError> =>
      contextManager.clear().pipe(
        Effect.map(() => ({ output: "Context window cleared." })),
        Effect.catchAll((err) =>
          Effect.fail(
            new CommandParseError({ input: "/clear", reason: String(err) }),
          ),
        ),
      ),
  }
}
