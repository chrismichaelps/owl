/** @Owl.TUI.Components.PromptInput - REPL prompt with mode prefix, history nav, slash dispatch */
import React, { memo, useState } from "react"
import { Box, Text, useInput, useWindowSize } from "ink"
import { COMMAND_CONSTANTS, TUI_WELCOME } from "../../core/constants/index.js"
import { rankPaletteCommands } from "../commands/fuzzy.js"
import type { Mode } from "../../core/schema/index.js"
import { usePromptHistory } from "../hooks/usePromptHistory.js"
import type { PaletteCommand } from "../commands/fuzzy.js"

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
  readonly onPaletteChange: (state: {
    readonly open: boolean
    readonly query: string
    readonly selectedIndex: number
  }) => void
  readonly commands: readonly PaletteCommand[]
}

/** @Owl.TUI.Components.PromptInput.Component - Command entry with history */
export const PromptInput: React.FC<PromptInputProps> = memo(
  ({
    mode,
    disabled,
    onSubmit,
    onCommand,
    onModeChange,
    onPaletteChange,
    commands,
  }) => {
    const [value, setValue] = useState("")
    const [paletteIndex, setPaletteIndex] = useState(0)
    const { push, up, down, reset } = usePromptHistory()
    const { columns } = useWindowSize()

    const updateValue = (next: string, nextIndex = paletteIndex): void => {
      setValue(next)
      const open = next.startsWith("/")
      const query = open ? next.slice(1) : ""
      const matches = rankPaletteCommands(commands, query)
      const boundedIndex =
        matches.length === 0 ? 0 : Math.min(nextIndex, matches.length - 1)
      setPaletteIndex(boundedIndex)
      onPaletteChange({ open, query, selectedIndex: boundedIndex })
    }

    const closePalette = (): void => {
      setPaletteIndex(0)
      onPaletteChange({ open: false, query: "", selectedIndex: 0 })
    }

    useInput(
      (input, key) => {
        if (disabled) return

        if (key.upArrow) {
          if (value.startsWith("/")) {
            const ranked = rankPaletteCommands(commands, value.slice(1))
            const nextIndex =
              ranked.length === 0 ? 0 : Math.max(0, paletteIndex - 1)
            setPaletteIndex(nextIndex)
            onPaletteChange({
              open: true,
              query: value.slice(1),
              selectedIndex: nextIndex,
            })
            return
          }
          const entry = up(value)
          updateValue(entry)
          return
        }

        if (key.downArrow) {
          if (value.startsWith("/")) {
            const ranked = rankPaletteCommands(commands, value.slice(1))
            const nextIndex =
              ranked.length === 0
                ? 0
                : Math.min(ranked.length - 1, paletteIndex + 1)
            setPaletteIndex(nextIndex)
            onPaletteChange({
              open: true,
              query: value.slice(1),
              selectedIndex: nextIndex,
            })
            return
          }
          const entry = down()
          updateValue(entry)
          return
        }

        if (key.escape) {
          closePalette()
          return
        }

        if (key.return) {
          const ranked = value.startsWith("/")
            ? rankPaletteCommands(commands, value.slice(1))
            : []
          const selected = ranked[paletteIndex]
          const submitted =
            value.startsWith("/") && selected !== undefined
              ? "/" + selected.name
              : value
          const trimmed = submitted.trim()
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

          updateValue("", 0)
          closePalette()
          return
        }

        if (key.backspace || key.delete) {
          updateValue(value.slice(0, -1))
          return
        }

        if (!key.ctrl && !key.meta && input.length > 0) {
          updateValue(value + input)
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
            {TUI_WELCOME.PROMPT_HINT} · {TUI_WELCOME.ROLE_HINT} ·{" "}
            {String(COMMAND_CONSTANTS.PALETTE_VISIBLE_COUNT)} shown
          </Text>
        ) : null}
      </Box>
    )
  },
)
