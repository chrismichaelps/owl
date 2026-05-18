/** @Owl.Providers.Router.Registry - Provider registry storage helpers */
import { Chunk, Effect, HashMap, Order, Ref } from "effect"
import { providerCapabilities, sortCapabilities } from "./capabilities.js"
import type { LLMProviderService, ProviderCapability } from "../types.js"

export type ProviderRegistryRef = Ref.Ref<
  HashMap.HashMap<string, LLMProviderService>
>

/** @Owl.Providers.Router.RegistryRef - Create provider registry state */
export const makeProviderRegistryRef = (): Effect.Effect<ProviderRegistryRef> =>
  Ref.make<HashMap.HashMap<string, LLMProviderService>>(HashMap.empty())

/** @Owl.Providers.Router.ProviderIds - List provider IDs deterministically */
export const listProviderIds = (
  registryRef: ProviderRegistryRef,
): Effect.Effect<Chunk.Chunk<string>> =>
  Ref.get(registryRef).pipe(
    Effect.map((registry) =>
      Chunk.sort(Chunk.fromIterable(HashMap.keys(registry)), Order.string),
    ),
  )

/** @Owl.Providers.Router.Capabilities - List capabilities deterministically */
export const listProviderCapabilities = (
  registryRef: ProviderRegistryRef,
): Effect.Effect<Chunk.Chunk<ProviderCapability>> =>
  Ref.get(registryRef).pipe(
    Effect.map((registry) => sortCapabilities(providerCapabilities(registry))),
  )

/** @Owl.Providers.Router.RegisterRef - Register provider in internal registry */
export const registerProviderInRef = (
  registryRef: ProviderRegistryRef,
  provider: LLMProviderService,
): void => {
  Effect.runSync(
    Ref.update(registryRef, (registry) =>
      HashMap.set(registry, provider.id, provider),
    ),
  )
}
