/** @Owl.Providers.Router.Health - Provider health inspection helpers */
import { Chunk, Data, Effect, HashMap, Option, Order, Ref } from "effect"
import type { ProviderError } from "../../core/errors/index.js"
import type { LLMProviderService } from "../types.js"
import type { ProviderRegistryRef } from "./registry.js"

/** @Owl.Providers.Router.HealthStatus - Provider health check result */
export interface ProviderHealthStatus {
  readonly provider: string
  readonly healthy: boolean
  readonly message: string | null
}

const formatHealthError = (error: ProviderError): string =>
  error instanceof Error ? error.message : String(error)

const inspectProviderHealth = (
  provider: LLMProviderService,
): Effect.Effect<ProviderHealthStatus> =>
  provider.healthCheck().pipe(
    Effect.map(() =>
      Data.struct({
        provider: provider.id,
        healthy: true,
        message: null,
      }),
    ),
    Effect.catchAll((error) =>
      Effect.succeed(
        Data.struct({
          provider: provider.id,
          healthy: false,
          message: formatHealthError(error),
        }),
      ),
    ),
  )

/** @Owl.Providers.Router.HealthCheck - Run registered provider health checks */
export const checkProviderHealth = (
  registryRef: ProviderRegistryRef,
): Effect.Effect<Chunk.Chunk<ProviderHealthStatus>> =>
  Ref.get(registryRef).pipe(
    Effect.flatMap((registry) => {
      const providerIds = Chunk.sort(
        Chunk.fromIterable(HashMap.keys(registry)),
        Order.string,
      )

      return Effect.forEach(providerIds, (providerId) => {
        const provider = Option.getOrUndefined(
          HashMap.get(registry, providerId),
        )
        return provider === undefined
          ? Effect.succeed(
              Data.struct({
                provider: providerId,
                healthy: false,
                message: "Provider missing from registry",
              }),
            )
          : inspectProviderHealth(provider)
      })
    }),
    Effect.map((statuses) => Chunk.fromIterable(statuses)),
  )
