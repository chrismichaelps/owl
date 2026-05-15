/** @Owl.Providers.Cost - Provider capability cost estimators */
import { estimateTokenCostUsd } from "../core/cost.js"
import type { ProviderCapability } from "./types.js"

/** @Owl.Providers.Cost.Capability - Estimate cost from capability pricing */
export const estimateCapabilityCostUsd = (
  capability: ProviderCapability,
  inputTokens: number,
  outputTokens: number,
): number =>
  estimateTokenCostUsd({
    inputTokens,
    outputTokens,
    inputCostPer1k: capability.inputCostPer1k,
    outputCostPer1k: capability.outputCostPer1k,
  })

/** @Owl.Providers.Cost.Model - Estimate cost for a model capability */
export const estimateModelCostUsd = (
  capabilities: readonly ProviderCapability[],
  modelId: string,
  inputTokens: number,
  outputTokens: number,
): number => {
  const capability = capabilities.find((entry) => entry.modelId === modelId)
  return capability === undefined
    ? 0
    : estimateCapabilityCostUsd(capability, inputTokens, outputTokens)
}
