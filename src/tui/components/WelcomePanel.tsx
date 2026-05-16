/** @Owl.TUI.Components.WelcomePanel - Claude-style startup workbench */
import React, { memo } from "react"
import { homedir } from "node:os"
import { Box, Text, useWindowSize } from "ink"
import { CLI_CONSTANTS, TUI_WELCOME } from "../../core/constants/index.js"
import { formatEstimatedCostUsd } from "../../core/cost.js"
import { AgentPipeline } from "./AgentPipeline.js"
import type { ActiveRole, AgentStatus } from "../state.js"
import type { Mode } from "../../core/schema/index.js"

interface WelcomePanelProps {
  readonly mode: Mode
  readonly status: AgentStatus
  readonly activeRole: ActiveRole
  readonly projectRoot: string
  readonly totalInputTokens: number
  readonly totalOutputTokens: number
  readonly totalEstimatedCostUsd: number
}

/** @Owl.TUI.Components.WelcomePanel.Path - Shortens home-relative paths */
export const formatProjectPath = (
  projectRoot: string,
  home = homedir(),
): string => {
  if (home.length > 0 && projectRoot.startsWith(home)) {
    return "~" + projectRoot.slice(home.length)
  }
  return projectRoot
}

/** @Owl.TUI.Components.WelcomePanel.Width - Resolves stable terminal width */
export const resolveWelcomeWidth = (columns: number): number =>
  Math.max(columns - 2, TUI_WELCOME.MIN_WIDTH)

/** @Owl.TUI.Components.WelcomePanel.Component - Startup identity and tips */
export const WelcomePanel: React.FC<WelcomePanelProps> = memo(
  ({
    mode,
    status,
    activeRole,
    projectRoot,
    totalInputTokens,
    totalOutputTokens,
    totalEstimatedCostUsd,
  }) => {
    const { columns } = useWindowSize()
    const width = resolveWelcomeWidth(columns)

    return (
      <Box
        borderStyle="round"
        borderColor="cyan"
        width={width}
        paddingX={2}
        paddingY={1}
        flexDirection="column"
      >
        <Box justifyContent="space-between">
          <Text bold color="cyanBright">
            {TUI_WELCOME.BRAND_TITLE} v{CLI_CONSTANTS.VERSION}
          </Text>
          <Text color="gray" dimColor>
            {TUI_WELCOME.BRAND_SUBTITLE}
          </Text>
        </Box>

        <Box marginTop={1}>
          <Box
            width={TUI_WELCOME.LEFT_COLUMN_WIDTH}
            flexDirection="column"
            alignItems="center"
          >
            <Text color="white" bold>
              Welcome back
            </Text>
            <Box marginY={1} flexDirection="column">
              {TUI_WELCOME.OWL_MARK.map((line) => (
                <Text key={line} color="cyan">
                  {line}
                </Text>
              ))}
            </Box>
            <Text color="gray">{formatProjectPath(projectRoot)}</Text>
            <Text color="magenta">
              {mode} · {status}
            </Text>
          </Box>

          <Box
            flexDirection="column"
            borderLeft
            borderStyle="single"
            borderColor="gray"
            paddingLeft={2}
            flexGrow={1}
          >
            <Text bold color="white">
              {TUI_WELCOME.GETTING_STARTED_TITLE}
            </Text>
            <Text color="gray">Run /help to browse slash commands</Text>
            <Text color="gray">
              Run /model to pin or clear routing preference
            </Text>
            <Text color="gray">
              Run /memory to inspect persisted session turns
            </Text>

            <Box marginTop={1}>
              <Text color="gray">
                {"─".repeat(TUI_WELCOME.SEPARATOR_MIN_WIDTH)}
              </Text>
            </Box>

            <Text bold color="white">
              {TUI_WELCOME.WHATS_NEW_TITLE}
            </Text>
            <Text color="gray">
              Tokens {String(totalInputTokens)}↑ {String(totalOutputTokens)}↓ ·{" "}
              {formatEstimatedCostUsd(totalEstimatedCostUsd)}
            </Text>
            <AgentPipeline activeRole={activeRole} />
          </Box>
        </Box>
      </Box>
    )
  },
)
