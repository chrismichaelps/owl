/** @Owl.TUI.Components.OutputPanel - Center panel: conversation thread + active spinner */
import React, { memo } from "react"
import { Box, Text, useWindowSize } from "ink"
import type { AgentStatus, ConversationTurn } from "../state.js"
import { ConversationThread } from "./ConversationThread.js"
import { MarkdownText } from "./MarkdownText.js"
import { AGENT_STATUS } from "../../core/constants/index.js"
import { Spinner } from "./Spinner.js"
import { useScrollableList } from "../hooks/useScrollableList.js"

interface OutputPanelProps {
  readonly status: AgentStatus
  readonly turns: readonly ConversationTurn[]
  readonly error: string | null
  readonly streamingContent: string
}

const ROWS_PER_TURN = 6

/** @Owl.TUI.Components.OutputPanel.Component - Center panel with response area */
export const OutputPanel: React.FC<OutputPanelProps> = memo(
  ({ status, turns, error, streamingContent }) => {
    const { rows } = useWindowSize()
    // Reserve rows for: border(2) + header(1) + marginTop(1) + statusbar(3) + prompt(4)
    const visibleRows = Math.max(1, Math.floor((rows - 11) / ROWS_PER_TURN))
    const isIdle =
      status === AGENT_STATUS.IDLE ||
      status === AGENT_STATUS.COMPLETE ||
      status === AGENT_STATUS.ERROR

    const { scrollOffset, canScrollUp, canScrollDown, scrollToBottom } =
      useScrollableList({
        totalItems: turns.length,
        visibleRows,
        isActive: isIdle && turns.length > visibleRows,
      })

    // Auto-scroll to bottom when new turns arrive
    React.useEffect(() => {
      if (isIdle && turns.length > 0) {
        scrollToBottom()
      }
    }, [turns.length, isIdle, scrollToBottom])

    const visibleTurns =
      turns.length > visibleRows
        ? turns.slice(scrollOffset, scrollOffset + visibleRows)
        : turns

    return (
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="green"
        paddingX={1}
        flexGrow={1}
      >
        <Box justifyContent="space-between">
          <Text bold color="greenBright">
            ◉ Response
          </Text>
          {turns.length > visibleRows ? (
            <Text color="gray" dimColor>
              {String(scrollOffset + 1)}-
              {String(Math.min(scrollOffset + visibleRows, turns.length))}/
              {String(turns.length)} {canScrollUp ? "▲" : " "}
              {canScrollDown ? "▼" : " "}
            </Text>
          ) : null}
        </Box>
        <Box flexDirection="column" flexGrow={1} marginTop={1}>
          {error !== null ? (
            <Text color="red">{error}</Text>
          ) : status === AGENT_STATUS.ROUTING ? (
            <Text color="gray" dimColor>
              Routing…
            </Text>
          ) : status === AGENT_STATUS.INFERRING ? (
            <Box flexDirection="column">
              <Spinner label="Inferring…" color="cyan" />
              {streamingContent.length > 0 ? (
                <Box marginTop={1}>
                  <MarkdownText content={streamingContent} />
                </Box>
              ) : null}
            </Box>
          ) : (
            <ConversationThread turns={visibleTurns} />
          )}
        </Box>
        {turns.length > visibleRows && isIdle ? (
          <Text color="gray" dimColor>
            Shift+↑/↓ or PgUp/PgDn to scroll
          </Text>
        ) : null}
      </Box>
    )
  },
)
