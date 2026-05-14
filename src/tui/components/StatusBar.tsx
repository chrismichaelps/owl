/** @Owl.TUI.Components.StatusBar - Bottom status: mode, cost, keybinding hints */
import React, { memo } from "react"
import { Box, Text } from "ink"
import type { AgentStatus } from "../state.js"

interface StatusBarProps {
  readonly status: AgentStatus
  readonly totalInputTokens: number
  readonly totalOutputTokens: number
  readonly mode: string
}

const STATUS_COLOR: Record<AgentStatus, string> = {
  idle: "gray",
  routing: "yellow",
  inferring: "cyan",
  complete: "green",
  error: "red",
}

/** @Owl.TUI.Components.StatusBar.Component - Bottom status bar */
export const StatusBar: React.FC<StatusBarProps> = memo(
  ({ status, totalInputTokens, totalOutputTokens, mode }) => (
    <Box
      borderStyle="single"
      borderColor="gray"
      paddingX={1}
      justifyContent="space-between"
    >
      {/* Left: version + mode */}
      <Box gap={2}>
        <Text color="gray" dimColor>
          Owl v0.1.0
        </Text>
        <Text color="magenta">[{mode.toUpperCase()}]</Text>
        <Text color={STATUS_COLOR[status]}>{status.toUpperCase()}</Text>
      </Box>

      {/* Center: token usage */}
      <Box gap={1}>
        <Text color="gray" dimColor>
          tokens:
        </Text>
        <Text color="yellow">
          {String(totalInputTokens)}↑ {String(totalOutputTokens)}↓
        </Text>
      </Box>

      {/* Right: keybindings */}
      <Box gap={2}>
        <Text color="gray" dimColor>
          [ctrl+c] quit
        </Text>
        <Text color="gray" dimColor>
          [/task /quick /deep]
        </Text>
      </Box>
    </Box>
  ),
)
