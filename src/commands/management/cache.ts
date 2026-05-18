/** @Owl.Commands.Management.Cache - Inspect and clear ContextCache state */
import { Effect } from "effect"
import { COMMAND_CONSTANTS } from "../../core/constants/index.js"
import { CommandParseError } from "../../core/errors/index.js"
import type { ContextCacheService } from "../../tokens/cache/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

const toCommandParseError = (input: string, error: unknown): CommandParseError =>
  new CommandParseError({
    input,
    reason: error instanceof Error ? error.message : String(error),
  })

/** @Owl.Commands.Management.Cache.Factory - Create the /cache command handler */
export function makeCacheCommand(cache: ContextCacheService): CommandHandler {
  return {
    name: "cache",
    description: "Show or clear reusable context cache: /cache [clear]",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> => {
      const subcommand = args[0]

      if (subcommand === COMMAND_CONSTANTS.CACHE_CLEAR_SUBCOMMAND) {
        return cache.invalidateAll().pipe(
          Effect.map(() => ({ output: "Context cache cleared." })),
          Effect.mapError((error) => toCommandParseError("/cache clear", error)),
        )
      }

      if (subcommand !== undefined) {
        return Effect.fail(
          new CommandParseError({
            input: "/cache " + subcommand,
            reason: "Usage: /cache [clear]",
          }),
        )
      }

      return cache.totalSavedTokens().pipe(
        Effect.map((savedTokens) => ({
          output:
            "Context cache\n" +
            "Saved tokens: " +
            String(savedTokens) +
            "\nRun /cache clear to reset reusable summaries.",
        })),
        Effect.mapError((error) => toCommandParseError("/cache", error)),
      )
    },
  }
}
