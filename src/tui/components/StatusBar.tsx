/** @Owl.TUI.Components.StatusBar - Bottom status: mode, cost, keybinding hints */
import React, { memo } from "react"
import { HashSet } from "effect"
import { Box, Text } from "ink"
import { formatEstimatedCostUsd } from "../../core/cost.js"
import {
  THINKING_MODES,
  AGENT_STATUS,
  TUI_ROUTING_COPY,
  TUI_TOKEN_PRESSURE_COPY,
  resolveModeCostBudget,
} from "../../core/constants/index.js"
import type { AgentStatus } from "../state.js"
import type { Mode, ProviderId } from "../../core/schema/index.js"
import {
  TOKEN_PRESSURE_LEVEL,
  resolveTokenPressure,
} from "../status/tokenPressure.js"

interface StatusBarProps {
  readonly status: AgentStatus
  readonly totalInputTokens: number
  readonly totalOutputTokens: number
  readonly totalEstimatedCostUsd: number
  readonly mode: string
  readonly providerOverride: ProviderId | null
  readonly privacyMode: boolean
  readonly model: string | null
  readonly routingMode: Mode | null
  readonly pendingMutationCount: number
}

const STATUS_COLOR: Record<AgentStatus, string> = {
  idle: "gray",
  routing: "yellow",
  inferring: "cyan",
  complete: "green",
  error: "red",
}

/** @Owl.TUI.Components.StatusBar.CostBudget - Render active routing ceiling */
export const formatModeCostBudget = (mode: string): string => {
  const budget = resolveModeCostBudget(mode)
  return budget === undefined ? "open" : formatEstimatedCostUsd(budget)
}

/** @Owl.TUI.Components.StatusBar.TokenPressure - Render context pressure */
export const formatTokenPressureWarning = (
  mode: string,
  inputTokens: number,
  outputTokens: number,
): string | null => {
  const pressure = resolveTokenPressure(mode, inputTokens, outputTokens)
  if (pressure.level === TOKEN_PRESSURE_LEVEL.OK) return null

  return (
    TUI_TOKEN_PRESSURE_COPY.PREFIX +
    ":" +
    String(pressure.remainingPercent) +
    TUI_TOKEN_PRESSURE_COPY.REMAINING_SUFFIX +
    " · " +
    TUI_TOKEN_PRESSURE_COPY.ACTION
  )
}

/** @Owl.TUI.Components.StatusBar.Component - Bottom status bar */
export const StatusBar: React.FC<StatusBarProps> = memo(
  ({
    status,
    totalInputTokens,
    totalOutputTokens,
    totalEstimatedCostUsd,
    mode,
    providerOverride,
    privacyMode,
    model,
    routingMode,
    pendingMutationCount,
  }) => {
    const pressure = resolveTokenPressure(
      mode,
      totalInputTokens,
      totalOutputTokens,
    )
    const pressureWarning = formatTokenPressureWarning(
      mode,
      totalInputTokens,
      totalOutputTokens,
    )

    return (
      <Box
        borderStyle="single"
        borderColor="gray"
        paddingX={1}
        justifyContent="space-between"
      >
        {/* Left: version + mode + model */}
        <Box gap={2}>
          <Text color="gray" dimColor>
            Owl v0.1.0
          </Text>
          <Text color="magenta">[{mode.toUpperCase()}]</Text>
          {routingMode !== null && routingMode !== mode ? (
            <Text color="blueBright">
              {TUI_ROUTING_COPY.LABEL.toLowerCase()}:{mode}
              {TUI_ROUTING_COPY.MODE_SEPARATOR}
              {routingMode}
            </Text>
          ) : null}
          {HashSet.has(THINKING_MODES, routingMode ?? mode) ? (
            <Text color="blueBright" dimColor>
              ◌ thinking
            </Text>
          ) : null}
          <Text color={STATUS_COLOR[status]}>{status.toUpperCase()}</Text>
          <Text color="cyan">route:{providerOverride ?? "auto"}</Text>
          {privacyMode ? <Text color="yellow">privacy:local</Text> : null}
          {pendingMutationCount > 0 ? (
            <Text color="yellow">pending:{String(pendingMutationCount)}</Text>
          ) : null}
          {model !== null ? (
            <Text color="gray" dimColor>
              {model.replace("claude-", "").replace(/-\d{8}$/, "")}
            </Text>
          ) : null}
        </Box>

        {/* Center: token usage */}
        <Box gap={2}>
          <Box gap={1}>
            <Text color="gray" dimColor>
              tokens:
            </Text>
            <Text color="yellow">
              {String(totalInputTokens)}↑ {String(totalOutputTokens)}↓
            </Text>
          </Box>
          <Box gap={1}>
            <Text color="gray" dimColor>
              cost:
            </Text>
            <Text color="green">
              {formatEstimatedCostUsd(totalEstimatedCostUsd)}
            </Text>
          </Box>
          <Box gap={1}>
            <Text color="gray" dimColor>
              budget:
            </Text>
            <Text color="green">{formatModeCostBudget(mode)}</Text>
          </Box>
          {pressureWarning !== null ? (
            <Text
              color={
                pressure.level === TOKEN_PRESSURE_LEVEL.CRITICAL
                  ? "red"
                  : "yellow"
              }
            >
              {pressureWarning}
            </Text>
          ) : null}
        </Box>

        {/* Right: keybindings — change hint when processing */}
        <Box gap={2}>
          {status === AGENT_STATUS.ROUTING ||
          status === AGENT_STATUS.INFERRING ? (
            <Text color="yellow" dimColor>
              [esc] cancel
            </Text>
          ) : (
            <Text color="gray" dimColor>
              [ctrl+c] quit
            </Text>
          )}
          <Text color="gray" dimColor>
            [/task /quick /deep] · [@file]
          </Text>
        </Box>
      </Box>
    )
  },
)
