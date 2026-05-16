/** @Owl.TUI.Components.MetaPanel - Right panel: provider, token, latency metrics */
import React, { memo } from "react"
import { Box, Text } from "ink"
import { formatEstimatedCostUsd } from "../../core/cost.js"
import type { OwlAppState } from "../state.js"

interface MetaPanelProps {
  readonly state: OwlAppState
}

/** @Owl.TUI.Components.MetaPanel.Row - Label-value metric row */
function MetricRow({
  label,
  value,
  valueColor = "white",
}: {
  readonly label: string
  readonly value: string
  readonly valueColor?: string
}): React.ReactElement {
  return (
    <Box>
      <Text color="gray">{label.padEnd(10)}</Text>
      <Text color={valueColor}>{value}</Text>
    </Box>
  )
}

/** @Owl.TUI.Components.MetaPanel.Component - Right metrics panel */
export const MetaPanel: React.FC<MetaPanelProps> = memo(({ state }) => (
  <Box
    flexDirection="column"
    borderStyle="round"
    borderColor="magenta"
    paddingX={1}
    width={28}
    flexShrink={0}
  >
    {/* Header */}
    <Text bold color="magentaBright">
      ◑ Metrics
    </Text>

    <Box flexDirection="column" gap={0} marginTop={1}>
      <MetricRow
        label="Provider"
        value={state.provider ?? "—"}
        valueColor="cyan"
      />
      <MetricRow label="Model" value={state.model ?? "—"} valueColor="cyan" />
      <MetricRow
        label="In tokens"
        value={String(state.totalInputTokens)}
        valueColor="yellow"
      />
      <MetricRow
        label="Out tokens"
        value={String(state.totalOutputTokens)}
        valueColor="yellow"
      />
      <MetricRow
        label="Cost"
        value={formatEstimatedCostUsd(state.totalEstimatedCostUsd)}
        valueColor="green"
      />
      <MetricRow
        label="Latency"
        value={state.latencyMs !== null ? `${String(state.latencyMs)}ms` : "—"}
        valueColor="white"
      />
      <MetricRow
        label="Turns"
        value={String(state.turnCount)}
        valueColor="white"
      />
    </Box>

    {/* FMCF roles legend */}
    <Text color="gray">{"─".repeat(22)}</Text>
    <Text color="gray" dimColor>
      Roles
    </Text>
    <Text color="blue" dimColor>
      ◆ Architect
    </Text>
    <Text color="yellow" dimColor>
      ◆ DNA Engineer
    </Text>
    <Text color="magenta" dimColor>
      ◆ Shadow
    </Text>
    <Text color="green" dimColor>
      ◆ Forensic Guardian
    </Text>
  </Box>
))
