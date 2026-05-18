/** @Owl.Tests.Tools.Permission - Permission policy regressions */
import { describe, expect, it } from "vitest"
import {
  TOOL_NAMES,
  TOOL_PERMISSION_BEHAVIORS,
  TOOL_PERMISSION_MODES,
  TOOL_RISK_LEVELS,
} from "../../src/core/constants/index.js"
import { resolveToolPermission } from "../../src/tools/permission.js"
import { classifyToolRisk } from "../../src/tools/risk.js"

const lowRisk = classifyToolRisk(TOOL_NAMES.READ)
const mediumRisk = classifyToolRisk(TOOL_NAMES.WRITE)
const highRisk = classifyToolRisk(TOOL_NAMES.BASH, {
  command: "node scripts/migrate.js",
})
const blockedRisk = classifyToolRisk(TOOL_NAMES.BASH, {
  command: "rm -rf dist",
})

describe("resolveToolPermission", () => {
  it("denies blocked ToolRisk in every Permission mode", () => {
    expect(
      resolveToolPermission(
        blockedRisk,
        TOOL_PERMISSION_MODES.BYPASS_PERMISSIONS,
      ).behavior,
    ).toBe(TOOL_PERMISSION_BEHAVIORS.DENY)
    expect(resolveToolPermission(blockedRisk).behavior).toBe(
      TOOL_PERMISSION_BEHAVIORS.DENY,
    )
  })

  it("allows low and medium risk in default mode", () => {
    expect(resolveToolPermission(lowRisk).behavior).toBe(
      TOOL_PERMISSION_BEHAVIORS.ALLOW,
    )
    expect(resolveToolPermission(mediumRisk).behavior).toBe(
      TOOL_PERMISSION_BEHAVIORS.ALLOW,
    )
  })

  it("asks for high risk in default and acceptEdits modes", () => {
    expect(resolveToolPermission(highRisk).behavior).toBe(
      TOOL_PERMISSION_BEHAVIORS.ASK,
    )
    expect(
      resolveToolPermission(highRisk, TOOL_PERMISSION_MODES.ACCEPT_EDITS)
        .behavior,
    ).toBe(TOOL_PERMISSION_BEHAVIORS.ASK)
  })

  it("denies mutating or high-risk tools in plan mode", () => {
    expect(
      resolveToolPermission(lowRisk, TOOL_PERMISSION_MODES.PLAN).behavior,
    ).toBe(TOOL_PERMISSION_BEHAVIORS.ALLOW)
    expect(
      resolveToolPermission(mediumRisk, TOOL_PERMISSION_MODES.PLAN).behavior,
    ).toBe(TOOL_PERMISSION_BEHAVIORS.DENY)
    expect(
      resolveToolPermission(highRisk, TOOL_PERMISSION_MODES.PLAN).behavior,
    ).toBe(TOOL_PERMISSION_BEHAVIORS.DENY)
  })

  it("denies high risk in dontAsk mode", () => {
    expect(
      resolveToolPermission(highRisk, TOOL_PERMISSION_MODES.DONT_ASK).behavior,
    ).toBe(TOOL_PERMISSION_BEHAVIORS.DENY)
  })

  it("allows non-blocked high risk in bypassPermissions mode", () => {
    expect(highRisk.level).toBe(TOOL_RISK_LEVELS.HIGH)
    expect(
      resolveToolPermission(highRisk, TOOL_PERMISSION_MODES.BYPASS_PERMISSIONS)
        .behavior,
    ).toBe(TOOL_PERMISSION_BEHAVIORS.ALLOW)
  })
})
