/**
 * @Owl.Commands.Management.Model - Control active RoutingPreference: /model
 *
 * Supports:
 * - /model
 * - /model auto
 * - /model <provider>
 *
 * @example
 * /model anthropic
 */
import { Chunk, Effect, HashSet } from "effect"
import {
  PROVIDER_IDS,
  PROVIDER_ID_SET,
  PROVIDER_AUTO,
} from "../../core/constants/index.js"
import { CommandParseError } from "../../core/errors/index.js"
import type { ProviderId } from "../../core/schema/index.js"
import type { RoutingPreferencesService } from "../../providers/preferences/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

/**
 * @Owl.Commands.Management.Model.Factory - Create the /model command handler
 */
export function makeModelCommand(
  routingPreferences: RoutingPreferencesService,
): CommandHandler {
  const validProviders = Chunk.toReadonlyArray(
    Chunk.fromIterable(PROVIDER_IDS),
  ).join(", ")
  const isProviderId = (value: string): value is ProviderId =>
    HashSet.has(PROVIDER_ID_SET, value)

  return {
    name: "model",
    description: "Show or set active Provider override: /model <provider|auto>",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> =>
      Effect.gen(function* () {
        const requestedProvider = args[0]

        if (requestedProvider === undefined) {
          const snapshot = yield* routingPreferences.snapshot()
          return {
            output:
              "Active provider: " +
              (snapshot.preferredProvider ?? "auto") +
              "\nAvailable providers: " +
              validProviders +
              "\nUse `/model auto` to restore automatic routing.",
          }
        }

        if (requestedProvider === PROVIDER_AUTO) {
          yield* routingPreferences.clearPreferredProvider()
          return {
            output: "Active provider: " + PROVIDER_AUTO,
          }
        }

        if (!isProviderId(requestedProvider)) {
          return yield* Effect.fail(
            new CommandParseError({
              input: "/model " + requestedProvider,
              reason:
                "Invalid provider. Valid providers: " +
                validProviders +
                ", " +
                PROVIDER_AUTO,
            }),
          )
        }

        yield* routingPreferences.setPreferredProvider(requestedProvider)
        return {
          output: "Active provider: " + requestedProvider,
        }
      }),
  }
}
