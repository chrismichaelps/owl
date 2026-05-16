/** @Owl.Providers.Router.Capabilities - Provider capability collection helpers */
import { Chunk, HashMap, Order } from "effect"
import type { LLMProviderService, ProviderCapability } from "../types.js"

/** @Owl.Providers.Router.CapabilityCollect - Flatten registered provider capabilities */
export const providerCapabilities = (
  registry: HashMap.HashMap<string, LLMProviderService>,
): Chunk.Chunk<ProviderCapability> =>
  Chunk.flatMap(Chunk.fromIterable(HashMap.values(registry)), (provider) =>
    Chunk.fromIterable(provider.capabilities),
  )

const capabilityOrder = Order.make<ProviderCapability>((left, right) => {
  const providerDelta = left.providerId.localeCompare(right.providerId)
  if (providerDelta < 0) return -1
  if (providerDelta > 0) return 1

  const modelDelta = left.modelId.localeCompare(right.modelId)
  if (modelDelta < 0) return -1
  if (modelDelta > 0) return 1
  return 0
})

/** @Owl.Providers.Router.CapabilitySort - Deterministic capability ordering */
export const sortCapabilities = (
  capabilities: Chunk.Chunk<ProviderCapability>,
): Chunk.Chunk<ProviderCapability> => Chunk.sort(capabilities, capabilityOrder)
