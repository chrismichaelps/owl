/** @Owl.Core.Cost - Deterministic USD cost helpers */
import { COST_CONSTANTS } from "./constants/index.js"

const precisionMultiplier = (): number =>
  COST_CONSTANTS.DECIMAL_BASE ** COST_CONSTANTS.ESTIMATE_PRECISION_DECIMALS

/** @Owl.Core.Cost.Estimate - Token pricing calculation */
export const estimateTokenCostUsd = ({
  inputTokens,
  outputTokens,
  inputCostPer1k,
  outputCostPer1k,
}: {
  readonly inputTokens: number
  readonly outputTokens: number
  readonly inputCostPer1k: number
  readonly outputCostPer1k: number
}): number => {
  const inputCost = (inputTokens / COST_CONSTANTS.TOKEN_UNIT) * inputCostPer1k
  const outputCost =
    (outputTokens / COST_CONSTANTS.TOKEN_UNIT) * outputCostPer1k
  return roundEstimatedCostUsd(inputCost + outputCost)
}

/** @Owl.Core.Cost.Round - Stable cost precision boundary */
export const roundEstimatedCostUsd = (costUsd: number): number => {
  const multiplier = precisionMultiplier()
  return Math.round(costUsd * multiplier) / multiplier
}

/** @Owl.Core.Cost.Format - Human-readable USD display */
export const formatEstimatedCostUsd = (costUsd: number): string => {
  const decimals =
    costUsd > COST_CONSTANTS.LOW_COST_THRESHOLD_USD
      ? COST_CONSTANTS.STANDARD_COST_DECIMAL_PLACES
      : COST_CONSTANTS.LOW_COST_DECIMAL_PLACES
  return `$${costUsd.toFixed(decimals)}`
}
