/** @Owl.TUI.Status.TokenPressure - Context budget warning state */
import { Data } from "effect"
import {
  TOKEN_PRESSURE_THRESHOLDS,
  resolveModeTokenBudget,
} from "../../core/constants/index.js"

export const TOKEN_PRESSURE_LEVEL = {
  OK: "ok",
  WARNING: "warning",
  CRITICAL: "critical",
} as const

export type TokenPressureLevel =
  (typeof TOKEN_PRESSURE_LEVEL)[keyof typeof TOKEN_PRESSURE_LEVEL]

export type TokenPressure = Readonly<{
  readonly level: TokenPressureLevel
  readonly budget: number
  readonly usedTokens: number
  readonly usedPercent: number
  readonly remainingPercent: number
}>

/** @Owl.TUI.Status.TokenPressure.Resolve - Derive context pressure */
export const resolveTokenPressure = (
  mode: string,
  inputTokens: number,
  outputTokens: number,
): TokenPressure => {
  const budget = resolveModeTokenBudget(mode)
  const usedTokens = Math.max(0, inputTokens + outputTokens)
  const rawRatio = budget <= 0 ? 1 : usedTokens / budget
  const usedPercent = Math.min(
    TOKEN_PRESSURE_THRESHOLDS.PERCENT_SCALE,
    Math.max(0, Math.round(rawRatio * TOKEN_PRESSURE_THRESHOLDS.PERCENT_SCALE)),
  )
  const remainingPercent = Math.max(
    0,
    TOKEN_PRESSURE_THRESHOLDS.PERCENT_SCALE - usedPercent,
  )
  const level =
    rawRatio >= TOKEN_PRESSURE_THRESHOLDS.CRITICAL_RATIO
      ? TOKEN_PRESSURE_LEVEL.CRITICAL
      : rawRatio >= TOKEN_PRESSURE_THRESHOLDS.WARNING_RATIO
        ? TOKEN_PRESSURE_LEVEL.WARNING
        : TOKEN_PRESSURE_LEVEL.OK

  return Data.struct({
    level,
    budget,
    usedTokens,
    usedPercent,
    remainingPercent,
  })
}
