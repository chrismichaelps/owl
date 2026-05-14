/** @Owl.TUI.Components.LogPanel - Left panel: engine logs, active role badge */
import React, { memo } from "react"
import { Box, Text } from "ink"
import type { AgentStatus, ActiveRole } from "../state.js"

const ROLE_COLOR: Record<NonNullable<ActiveRole>, string> = {
  Architect: "blue",
  "DNA Engineer": "yellow",
  Shadow: "magenta",
  "Forensic Guardian": "green",
}

const STATUS_ICON: Record<AgentStatus, string> = {
  idle: "●",
  routing: "◆",
  inferring: "◈",
  complete: "✓",
  error: "✗",
}

const STATUS_COLOR: Record<AgentStatus, string> = {
  idle: "gray",
  routing: "yellow",
  inferring: "cyan",
  complete: "green",
  error: "red",
}

interface LogPanelProps {
  readonly logs: readonly string[]
  readonly status: AgentStatus
  readonly activeRole: ActiveRole
}

/** @Owl.TUI.Components.LogPanel.Component - Left panel with logs and role badge */
export const LogPanel: React.FC<LogPanelProps> = memo(
  ({ logs, status, activeRole }) => (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="blue"
      paddingX={1}
      width={32}
      flexShrink={0}
    >
      {/* Header */}
      <Text bold color="blueBright">
        ◈ Owl Engine
      </Text>

      {/* Status badge */}
      <Box marginTop={1} gap={1}>
        <Text color={STATUS_COLOR[status]} bold>
          {STATUS_ICON[status]}
        </Text>
        <Text color={STATUS_COLOR[status]}>{status.toUpperCase()}</Text>
      </Box>

      {/* Active role */}
      {activeRole !== null ? (
        <Box marginTop={1}>
          <Text color="gray">Role: </Text>
          <Text color={ROLE_COLOR[activeRole]} bold>
            {activeRole}
          </Text>
        </Box>
      ) : null}

      {/* Divider */}
      <Text color="gray">{"─".repeat(26)}</Text>

      {/* Recent logs */}
      <Box flexDirection="column" flexGrow={1}>
        {logs.slice(-18).map((log, i) => (
          <Text key={i} color="gray" dimColor wrap="truncate">
            {log}
          </Text>
        ))}
      </Box>
    </Box>
  ),
)
