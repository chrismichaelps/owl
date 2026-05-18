/** @Owl.Tools.Risk - Deterministic built-in ToolRisk classifier */
import { Chunk, Data, HashSet } from "effect"
import {
  TOOL_NAMES,
  TOOL_RISK_BASH,
  TOOL_RISK_LEVELS,
} from "../core/constants/index.js"

export type ToolRiskLevel =
  (typeof TOOL_RISK_LEVELS)[keyof typeof TOOL_RISK_LEVELS]

export type ToolRiskAssessment = Readonly<{
  readonly toolName: string
  readonly level: ToolRiskLevel
  readonly reason: string
}>

const makeAssessment = (
  toolName: string,
  level: ToolRiskLevel,
  reason: string,
): ToolRiskAssessment =>
  Data.struct({
    toolName,
    level,
    reason,
  })

const readCommand = (input?: Record<string, unknown>): string | null => {
  if (input === undefined) return null
  const command = input.command
  return typeof command === "string" ? command : null
}

const firstCommandToken = (command: string): string => {
  const trimmed = command.trim().toLocaleLowerCase()
  if (trimmed.length === 0) return ""
  return trimmed.split(TOOL_RISK_BASH.TOKEN_SPLIT_PATTERN)[0] ?? ""
}

const hasBlockedPattern = (command: string): boolean => {
  const normalized = command.toLocaleLowerCase()
  return Chunk.some(TOOL_RISK_BASH.BLOCKED_PATTERNS, (pattern) =>
    normalized.includes(pattern),
  )
}

const classifyBashRisk = (
  input?: Record<string, unknown>,
): ToolRiskAssessment => {
  const command = readCommand(input)
  if (command === null || command.trim().length === 0) {
    return makeAssessment(
      TOOL_NAMES.BASH,
      TOOL_RISK_LEVELS.HIGH,
      "Bash command is missing or empty",
    )
  }

  if (hasBlockedPattern(command)) {
    return makeAssessment(
      TOOL_NAMES.BASH,
      TOOL_RISK_LEVELS.BLOCKED,
      "Bash command matches a blocked shell pattern",
    )
  }

  const token = firstCommandToken(command)
  if (HashSet.has(TOOL_RISK_BASH.READ_ONLY_COMMANDS, token)) {
    return makeAssessment(
      TOOL_NAMES.BASH,
      TOOL_RISK_LEVELS.MEDIUM,
      "Bash command starts with a read-only command token",
    )
  }

  return makeAssessment(
    TOOL_NAMES.BASH,
    TOOL_RISK_LEVELS.HIGH,
    "Bash command is not in the read-only allowlist",
  )
}

/** @Owl.Tools.Risk.Classify - Classify built-in tool invocation risk */
export const classifyToolRisk = (
  toolName: string,
  input?: Record<string, unknown>,
): ToolRiskAssessment => {
  switch (toolName) {
    case TOOL_NAMES.READ:
    case TOOL_NAMES.GLOB:
    case TOOL_NAMES.GREP:
      return makeAssessment(toolName, TOOL_RISK_LEVELS.LOW, "Read-only tool")
    case TOOL_NAMES.WRITE:
    case TOOL_NAMES.EDIT:
      return makeAssessment(
        toolName,
        TOOL_RISK_LEVELS.MEDIUM,
        "File Mutation tool",
      )
    case TOOL_NAMES.BASH:
      return classifyBashRisk(input)
    default:
      return makeAssessment(toolName, TOOL_RISK_LEVELS.HIGH, "Unknown tool")
  }
}

/** @Owl.Tools.Risk.Format - Render compact ToolRisk text */
export const formatToolRisk = (assessment: ToolRiskAssessment): string =>
  assessment.level + " — " + assessment.reason
