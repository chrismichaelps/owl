/** @Owl.Commands.Management.Clear - Clear the active context window: /clear */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { ContextManagerService } from "../../engine/context/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

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
