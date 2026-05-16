/** @Owl.Commands.Management.Privacy - Control local-only provider routing */
import { Effect } from "effect"
import { CommandParseError } from "../../core/errors/index.js"
import type { RoutingPreferencesService } from "../../providers/preferences/index.js"
import type { CommandHandler, CommandResult } from "../types.js"

/** @Owl.Commands.Management.Privacy.Factory - Create /privacy handler */
export function makePrivacyCommand(
  routingPreferences: RoutingPreferencesService,
): CommandHandler {
  return {
    name: "privacy",
    description: "Show or set local-only routing: /privacy <on|off>",
    execute: (args): Effect.Effect<CommandResult, CommandParseError> =>
      Effect.gen(function* () {
        const requested = args[0]
        if (requested === undefined || requested === "status") {
          const enabled = yield* routingPreferences.getPrivacyMode()
          return {
            output:
              "Privacy mode: " +
              (enabled ? "on" : "off") +
              "\nWhen on, routing is constrained to local providers only.",
          }
        }

        if (requested === "on") {
          yield* routingPreferences.setPrivacyMode(true)
          return {
            output:
              "Privacy mode: on\nCloud fallback disabled; Owl will route only to local providers.",
          }
        }

        if (requested === "off") {
          yield* routingPreferences.setPrivacyMode(false)
          return {
            output:
              "Privacy mode: off\nAutomatic multi-provider routing restored.",
          }
        }

        return yield* Effect.fail(
          new CommandParseError({
            input: "/privacy " + requested,
            reason: "Usage: /privacy <on|off|status>",
          }),
        )
      }),
  }
}
