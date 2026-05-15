/** @Owl.TUI.Components.PromptInput - REPL prompt with mode prefix, history nav, slash dispatch */
import React, { memo, useState } from "react"
import { Box, Text, useInput, useWindowSize } from "ink"
import { TUI_WELCOME } from "../../core/constants/index.js"
import type { Mode } from "../../core/schema/index.js"
import { usePromptHistory } from "../hooks/usePromptHistory.js"

const MODE_COLOR: Record<Mode, string> = {
  standard: "green",
  quick: "yellow",
  deep: "blue",
  economy: "gray",
  god: "red",
}

/** Mode detection for slash commands */
const SLASH_MODE_MAP: Partial<Record<string, Mode>> = {
  "/task": "standard",
  "/quick": "quick",
  "/deep": "deep",
  "/economy": "economy",
  "/god": "god",
}

function detectSlashMode(value: string): Mode | null {
  for (const [prefix, mode] of Object.entries(SLASH_MODE_MAP)) {
    if (value === prefix || value.startsWith(prefix + " ")) {
      return mode ?? null
    }
  }
  return null
}

interface PromptInputProps {
  readonly mode: Mode
  readonly disabled: boolean
  readonly onSubmit: (prompt: string, mode: Mode) => void
  readonly onCommand: (raw: string) => void
  readonly onModeChange: (mode: Mode) => void
}

/** @Owl.TUI.Components.PromptInput.Component - Command entry with history */
export const PromptInput: React.FC<PromptInputProps> = memo(
  ({ mode, disabled, onSubmit, onCommand, onModeChange }) => {
    const [value, setValue] = useState("")
    const { push, up, down, reset } = usePromptHistory()
    const { columns } = useWindowSize()

    useInput(
      (input, key) => {
        if (disabled) return

        if (key.upArrow) {
          const entry = up(value)
          setValue(entry)
          return
        }

        if (key.downArrow) {
          const entry = down()
          setValue(entry)
          return
        }

        if (key.return) {
          const trimmed = value.trim()
          if (trimmed.length === 0) return

          push(trimmed)
          reset()

          if (trimmed.startsWith("/")) {
            const detected = detectSlashMode(trimmed)
            if (detected !== null) {
              onModeChange(detected)
              const firstSpace = trimmed.indexOf(" ")
              if (firstSpace !== -1) {
                const rest = trimmed.slice(firstSpace + 1).trim()
                if (rest.length > 0) {
                  onSubmit(rest, detected)
                }
              }
            } else {
              onCommand(trimmed)
            }
          } else {
            onSubmit(trimmed, mode)
          }

          setValue("")
          return
        }

        if (key.backspace || key.delete) {
          setValue((v) => v.slice(0, -1))
          return
        }

        if (!key.ctrl && !key.meta && input.length > 0) {
          setValue((v) => v + input)
        }
      },
      { isActive: !disabled },
    )

    const detectedMode = value.length > 0 ? detectSlashMode(value) : null
    const displayMode = detectedMode ?? mode
    const separatorWidth = Math.max(
      columns - 1,
      TUI_WELCOME.SEPARATOR_MIN_WIDTH,
    )

    return (
      <Box flexDirection="column">
        <Text color="gray" dimColor>
          {"─".repeat(separatorWidth)}
        </Text>
        <Box paddingX={1}>
          <Text color={MODE_COLOR[displayMode]} bold>
            ❯
          </Text>
          <Text color="gray"> {displayMode} </Text>
          <Text>
            {value}
            {!disabled ? <Text color="white">█</Text> : null}
          </Text>
          {disabled ? (
            <Text color="gray" dimColor>
              {" "}
              (processing...)
            </Text>
          ) : null}
        </Box>
        <Text color="gray" dimColor>
          {"─".repeat(separatorWidth)}
        </Text>
        {!disabled ? (
          <Text color="gray" dimColor>
            {"  "}
            {TUI_WELCOME.PROMPT_HINT} · {TUI_WELCOME.ROLE_HINT}
          </Text>
        ) : null}
      </Box>
    )
  },
)
