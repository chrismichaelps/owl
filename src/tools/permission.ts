/** @Owl.Tools.Permission - Deterministic tool Permission resolver */
import { Data } from "effect"
import {
  TOOL_PERMISSION_BEHAVIORS,
  TOOL_PERMISSION_MODES,
  TOOL_RISK_LEVELS,
} from "../core/constants/index.js"
import type { ToolRiskAssessment } from "./risk.js"

export type ToolPermissionMode =
  (typeof TOOL_PERMISSION_MODES)[keyof typeof TOOL_PERMISSION_MODES]

export type ToolPermissionBehavior =
  (typeof TOOL_PERMISSION_BEHAVIORS)[keyof typeof TOOL_PERMISSION_BEHAVIORS]

export type ToolPermissionDecision = Readonly<{
  readonly behavior: ToolPermissionBehavior
  readonly reason: string
  readonly mode: ToolPermissionMode
  readonly risk: ToolRiskAssessment
}>

const makeDecision = (
  behavior: ToolPermissionBehavior,
  reason: string,
  mode: ToolPermissionMode,
  risk: ToolRiskAssessment,
): ToolPermissionDecision =>
  Data.struct({
    behavior,
    reason,
    mode,
    risk,
  })

const allow = (
  reason: string,
  mode: ToolPermissionMode,
  risk: ToolRiskAssessment,
): ToolPermissionDecision =>
  makeDecision(TOOL_PERMISSION_BEHAVIORS.ALLOW, reason, mode, risk)

const ask = (
  reason: string,
  mode: ToolPermissionMode,
  risk: ToolRiskAssessment,
): ToolPermissionDecision =>
  makeDecision(TOOL_PERMISSION_BEHAVIORS.ASK, reason, mode, risk)

const deny = (
  reason: string,
  mode: ToolPermissionMode,
  risk: ToolRiskAssessment,
): ToolPermissionDecision =>
  makeDecision(TOOL_PERMISSION_BEHAVIORS.DENY, reason, mode, risk)

/** @Owl.Tools.Permission.Resolve - Resolve Permission behavior from ToolRisk */
export const resolveToolPermission = (
  risk: ToolRiskAssessment,
  mode: ToolPermissionMode = TOOL_PERMISSION_MODES.DEFAULT,
): ToolPermissionDecision => {
  if (risk.level === TOOL_RISK_LEVELS.BLOCKED) {
    return deny(
      "Blocked ToolRisk is denied in every Permission mode",
      mode,
      risk,
    )
  }

  switch (mode) {
    case TOOL_PERMISSION_MODES.PLAN:
      return risk.level === TOOL_RISK_LEVELS.LOW
        ? allow("Plan mode allows read-only tools", mode, risk)
        : deny("Plan mode denies mutating or high-risk tools", mode, risk)

    case TOOL_PERMISSION_MODES.DONT_ASK:
      return risk.level === TOOL_RISK_LEVELS.HIGH
        ? deny("dontAsk mode denies high-risk tools", mode, risk)
        : allow(
            "dontAsk mode allows pre-approved low and medium risk",
            mode,
            risk,
          )

    case TOOL_PERMISSION_MODES.ACCEPT_EDITS:
      return risk.level === TOOL_RISK_LEVELS.HIGH
        ? ask("acceptEdits mode asks for high-risk tools", mode, risk)
        : allow("acceptEdits mode allows low and medium risk", mode, risk)

    case TOOL_PERMISSION_MODES.BYPASS_PERMISSIONS:
      return allow(
        "bypassPermissions mode allows non-blocked tools",
        mode,
        risk,
      )

    case TOOL_PERMISSION_MODES.DEFAULT:
      return risk.level === TOOL_RISK_LEVELS.HIGH
        ? ask("default mode asks for high-risk tools", mode, risk)
        : allow("default mode allows low and medium risk", mode, risk)
  }
}

/** @Owl.Tools.Permission.Format - Render compact Permission text */
export const formatToolPermission = (
  decision: ToolPermissionDecision,
): string => decision.behavior + " — " + decision.reason
