/** @Owl.Tests.Tools.Risk - ToolRisk classification regressions */
import { describe, expect, it } from "vitest"
import { TOOL_NAMES, TOOL_RISK_LEVELS } from "../../src/core/constants/index.js"
import { classifyToolRisk, formatToolRisk } from "../../src/tools/risk.js"

describe("classifyToolRisk", () => {
  it("classifies read-only tools as low risk", () => {
    expect(classifyToolRisk(TOOL_NAMES.READ).level).toBe(TOOL_RISK_LEVELS.LOW)
    expect(classifyToolRisk(TOOL_NAMES.GLOB).level).toBe(TOOL_RISK_LEVELS.LOW)
    expect(classifyToolRisk(TOOL_NAMES.GREP).level).toBe(TOOL_RISK_LEVELS.LOW)
  })

  it("classifies file mutation tools as medium risk", () => {
    expect(classifyToolRisk(TOOL_NAMES.WRITE).level).toBe(
      TOOL_RISK_LEVELS.MEDIUM,
    )
    expect(classifyToolRisk(TOOL_NAMES.EDIT).level).toBe(
      TOOL_RISK_LEVELS.MEDIUM,
    )
  })

  it("classifies known read-only Bash commands as medium risk", () => {
    const risk = classifyToolRisk(TOOL_NAMES.BASH, {
      command: "git status --short",
    })

    expect(risk.level).toBe(TOOL_RISK_LEVELS.MEDIUM)
    expect(risk.reason).toContain("read-only")
  })

  it("blocks Bash commands with destructive shell patterns", () => {
    const risk = classifyToolRisk(TOOL_NAMES.BASH, {
      command: "rm -rf dist",
    })

    expect(risk.level).toBe(TOOL_RISK_LEVELS.BLOCKED)
  })

  it("keeps unknown Bash commands high risk", () => {
    const risk = classifyToolRisk(TOOL_NAMES.BASH, {
      command: "node scripts/migrate.js",
    })

    expect(risk.level).toBe(TOOL_RISK_LEVELS.HIGH)
  })

  it("formats ToolRisk compactly", () => {
    expect(formatToolRisk(classifyToolRisk(TOOL_NAMES.READ))).toBe(
      "low — Read-only tool",
    )
  })
})
