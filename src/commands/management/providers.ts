/** @Owl.Commands.Management.Providers - Inspect registered provider capabilities */
import { Effect } from "effect"
import { formatEstimatedCostUsd } from "../../core/cost.js"
import type { CommandParseError } from "../../core/errors/index.js"
import type { RoutingPreferencesService } from "../../providers/preferences/index.js"
import type { ProviderRouterService } from "../../providers/router/index.js"
import type { ProviderCapability } from "../../providers/types.js"
import type { CommandHandler, CommandResult } from "../types.js"

/** @Owl.Commands.Management.Providers.Format - Human-readable capability row */
export function formatProviderCapability(
  capability: ProviderCapability,
): string {
  return [
    "- ",
    capability.providerId,
    "/",
    capability.modelId,
    " · ",
    capability.reasoningDepth,
    " reasoning · ",
    String(capability.contextWindow),
    " ctx · ",
    formatEstimatedCostUsd(capability.inputCostPer1k),
    " in / ",
    formatEstimatedCostUsd(capability.outputCostPer1k),
    " out per 1K",
  ].join("")
}

/** @Owl.Commands.Management.Providers.Factory - Create the /providers handler */
export function makeProvidersCommand(
  router: ProviderRouterService,
  routingPreferences: RoutingPreferencesService,
): CommandHandler {
  return {
    name: "providers",
    description: "List registered provider models and routing capabilities",
    execute: (): Effect.Effect<CommandResult, CommandParseError> =>
      Effect.gen(function* () {
        const preferences = yield* routingPreferences.snapshot()
        const capabilities = yield* router.listCapabilities()

        if (capabilities.length === 0) {
          return {
            output:
              "Active provider: " +
              (preferences.preferredProvider ?? "auto") +
              "\nNo providers are registered.",
          }
        }

        return {
          output:
            "Active provider: " +
            (preferences.preferredProvider ?? "auto") +
            "\nRegistered models:\n" +
            capabilities.map(formatProviderCapability).join("\n"),
        }
      }),
  }
}
