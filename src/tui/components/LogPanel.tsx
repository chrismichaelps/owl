/** @Owl.TUI.Components.LogPanel - Left panel: engine logs, active role badge */
import React, { memo } from "react"
import { Box, Text } from "ink"
import type { AgentStatus, ActiveRole } from "../state.js"
import { AgentPipeline } from "./AgentPipeline.js"
import { TUI_LOG_PANEL } from "../../core/constants/index.js"
import {
  resolveRoleColor,
  resolveStatusColor,
  resolveStatusIcon,
} from "../status/visuals.js"

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
      width={TUI_LOG_PANEL.PANEL_WIDTH}
      flexShrink={0}
    >
      {/* Header */}
      <Text bold color="blueBright">
        ◈ Owl Engine
      </Text>

      {/* Status badge */}
      <Box marginTop={1} gap={1}>
        <Text color={resolveStatusColor(status)} bold>
          {resolveStatusIcon(status)}
        </Text>
        <Text color={resolveStatusColor(status)}>{status.toUpperCase()}</Text>
      </Box>

      {/* Active role */}
      {activeRole !== null ? (
        <Box marginTop={1}>
          <Text color="gray">Role: </Text>
          <Text color={resolveRoleColor(activeRole)} bold>
            {activeRole}
          </Text>
        </Box>
      ) : null}

      <AgentPipeline activeRole={activeRole} />

      {/* Divider */}
      <Text color="gray">{"─".repeat(TUI_LOG_PANEL.DIVIDER_WIDTH)}</Text>

      {/* Recent logs */}
      <Box flexDirection="column" flexGrow={1}>
        {logs.slice(-TUI_LOG_PANEL.VISIBLE_LINES).map((log, i) => (
          <Text key={i} color="gray" dimColor wrap="truncate">
            {log}
          </Text>
        ))}
      </Box>
    </Box>
  ),
)
