/** @Owl.Commands.Management.Providers - Inspect registered provider capabilities */
import { Chunk, Effect } from "effect"
import { formatEstimatedCostUsd } from "../../core/cost.js"
import type { CommandParseError } from "../../core/errors/index.js"
import type { RoutingPreferencesService } from "../../providers/preferences/index.js"
import type {
  ProviderHealthStatus,
  ProviderRouterService,
} from "../../providers/router/index.js"
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

/** @Owl.Commands.Management.Providers.Health - Human-readable health row */
export function formatProviderHealth(status: ProviderHealthStatus): string {
  const suffix = status.message === null ? "" : " — " + status.message
  return (
    "- " +
    status.provider +
    ": " +
    (status.healthy ? "healthy" : "unhealthy") +
    suffix
  )
}

/** @Owl.Commands.Management.Providers.Factory - Create the /providers handler */
export function makeProvidersCommand(
  router: ProviderRouterService,
  routingPreferences: RoutingPreferencesService,
  name = "providers",
): CommandHandler {
  return {
    name,
    description: "List registered provider models and routing capabilities",
    execute: (): Effect.Effect<CommandResult, CommandParseError> =>
      Effect.gen(function* () {
        const preferences = yield* routingPreferences.snapshot()
        const health = Chunk.fromIterable(yield* router.checkHealth())
        const capabilities = Chunk.fromIterable(
          yield* router.listCapabilities(),
        )
        const healthSection = Chunk.isEmpty(health)
          ? ""
          : "\nProvider health:\n" +
            Chunk.toReadonlyArray(Chunk.map(health, formatProviderHealth)).join(
              "\n",
            )

        if (Chunk.isEmpty(capabilities)) {
          return {
            output:
              "Active provider: " +
              (preferences.preferredProvider ?? "auto") +
              "\nNo providers are registered." +
              healthSection,
          }
        }

        return {
          output:
            "Active provider: " +
            (preferences.preferredProvider ?? "auto") +
            "\nRegistered models:\n" +
            Chunk.toReadonlyArray(
              Chunk.map(capabilities, formatProviderCapability),
            ).join("\n") +
            healthSection,
        }
      }),
  }
}
