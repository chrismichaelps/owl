/** @Owl.TUI.Components.StatusBar - Bottom status: mode, cost, keybinding hints */
import React, { memo } from "react"
import { Box, Text } from "ink"
import { formatEstimatedCostUsd } from "../../core/cost.js"
import type { AgentStatus } from "../state.js"
import type { ProviderId } from "../../core/schema/index.js"

interface StatusBarProps {
  readonly status: AgentStatus
  readonly totalInputTokens: number
  readonly totalOutputTokens: number
  readonly totalEstimatedCostUsd: number
  readonly mode: string
  readonly providerOverride: ProviderId | null
  readonly model: string | null
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
  ({
    status,
    totalInputTokens,
    totalOutputTokens,
    totalEstimatedCostUsd,
    mode,
    providerOverride,
    model,
  }) => (
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
        {mode === "deep" || mode === "god" ? (
          <Text color="blueBright" dimColor>
            ◌ thinking
          </Text>
        ) : null}
        <Text color={STATUS_COLOR[status]}>{status.toUpperCase()}</Text>
        <Text color="cyan">route:{providerOverride ?? "auto"}</Text>
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
      </Box>

      {/* Right: keybindings — change hint when processing */}
      <Box gap={2}>
        {status === "routing" || status === "inferring" ? (
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
  ),
)
