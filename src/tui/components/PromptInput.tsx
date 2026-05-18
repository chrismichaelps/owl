/** @Owl.TUI.Components.PromptInput - REPL prompt with mode prefix, history nav, slash dispatch */
import React, { memo, useCallback, useRef, useState } from "react"
import { Box, Text, useInput, useWindowSize } from "ink"
import { Option, type Chunk } from "effect"
import {
  COMMAND_CONSTANTS,
  TUI_WELCOME,
  TUI_TRIGGERS,
} from "../../core/constants/index.js"
import { detectSlashMode, resolveModeColor } from "../commands/modes.js"
import type { Mode } from "../../core/schema/index.js"
import { usePromptHistory } from "../hooks/usePromptHistory.js"
import { useFileMentions } from "../hooks/useFileMentions.js"
import { useSlashPalette } from "../hooks/useSlashPalette.js"
import { resolvePendingApprovalShortcut } from "../pending/shortcuts.js"
import type { PaletteCommand } from "../commands/fuzzy.js"
import { FileMentionPalette } from "./FileMentionPalette.js"

interface PromptInputProps {
  readonly mode: Mode
  readonly disabled: boolean
  readonly projectRoot?: string
  readonly onSubmit: (prompt: string, mode: Mode) => void
  readonly onCommand: (raw: string) => void
  readonly onModeChange: (mode: Mode) => void
  readonly onShortcuts: () => void
  readonly onPaletteChange: (state: {
    readonly open: boolean
    readonly query: string
    readonly selectedIndex: number
  }) => void
  readonly commands: readonly PaletteCommand[]
  readonly pendingMutationIds: Chunk.Chunk<string>
  readonly focusedPanel: string
}

/** @Owl.TUI.Components.PromptInput.Component - Command entry with history */
export const PromptInput: React.FC<PromptInputProps> = memo(
  ({
    mode,
    disabled,
    projectRoot,
    onSubmit,
    onCommand,
    onModeChange,
    onShortcuts,
    onPaletteChange,
    commands,
    pendingMutationIds,
    focusedPanel,
  }) => {
    // Refs hold the authoritative current value — readable inside useInput without stale closures.
    // State is only used to trigger re-renders.
    const valueRef = useRef("")
    const [value, setValueState] = useState("")
    const { push, up, down, reset } = usePromptHistory(projectRoot)
    const { columns } = useWindowSize()

    const mentions = useFileMentions(value, projectRoot)
    const palette = useSlashPalette(
      commands,
      onPaletteChange,
      pendingMutationIds,
    )

    const setValue = useCallback((next: string) => {
      valueRef.current = next
      setValueState(next)
    }, [])

    const updateValue = useCallback(
      (next: string, nextIndex?: number): void => {
        setValue(next)
        palette.updateForValue(next, nextIndex)
      },
      [setValue, palette],
    )

    const closePalette = useCallback((): void => {
      palette.close()
    }, [palette])

    useInput(
      (input, key) => {
        if (disabled) return

        // Read from refs — never from stale state closure
        const cur = valueRef.current
        const inMention = mentions.isMentionInput(cur)

        if (cur.length === 0) {
          const shortcut = resolvePendingApprovalShortcut(
            input,
            focusedPanel,
            pendingMutationIds,
          )
          if (Option.isSome(shortcut)) {
            onCommand(shortcut.value.command)
            return
          }
        }

        if (input === TUI_TRIGGERS.HELP && cur.length === 0) {
          onShortcuts()
          return
        }

        // @file mention palette navigation takes priority
        if (inMention) {
          if (key.upArrow) {
            mentions.moveMentionIndex(-1)
            return
          }
          if (key.downArrow) {
            mentions.moveMentionIndex(1)
            return
          }
          if (key.tab || key.return) {
            const selected = mentions.selectedFile()
            if (selected !== undefined) {
              updateValue(mentions.completeMention(cur, selected.path) + " ")
              return
            }
          }
          if (key.escape) {
            // dismiss mention palette by inserting a space (break the @ sequence)
            updateValue(cur + " ")
            return
          }
        }

        if (key.upArrow) {
          if (cur.startsWith(TUI_TRIGGERS.PALETTE)) {
            palette.move(cur, -1)
            return
          }
          const entry = up(cur)
          updateValue(entry)
          return
        }

        if (key.downArrow) {
          if (cur.startsWith(TUI_TRIGGERS.PALETTE)) {
            palette.move(cur, 1)
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

        if (key.tab && cur.startsWith(TUI_TRIGGERS.PALETTE)) {
          const completed = palette.completeSelected(cur)
          if (completed !== undefined) {
            updateValue(completed, 0)
          }
          return
        }

        if (key.rightArrow && cur.startsWith(TUI_TRIGGERS.PALETTE)) {
          const completed = palette.completeSelected(cur)
          if (completed !== undefined) {
            updateValue(completed, 0)
          }
          return
        }

        if (key.return) {
          const isPaletteInput = cur.startsWith(TUI_TRIGGERS.PALETTE)
          const selected = palette.selectedCommand(cur)
          if (
            isPaletteInput &&
            cur === TUI_TRIGGERS.PALETTE &&
            selected !== undefined
          ) {
            const completed = palette.completeSelected(cur)
            if (completed !== undefined) {
              updateValue(completed, 0)
            }
            return
          }

          const submitted = isPaletteInput
            ? (palette.completeSelected(cur) ?? cur)
            : cur
          const trimmed = submitted.trim()
          if (trimmed.length === 0) return

          push(trimmed)
          reset()

          if (trimmed.startsWith(TUI_TRIGGERS.PALETTE)) {
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
          updateValue(cur.slice(0, -1))
          return
        }

        if (!key.ctrl && !key.meta && input.length > 0) {
          updateValue(cur + input)
        }
      },
      { isActive: !disabled },
    )

    const detectedMode = value.length > 0 ? detectSlashMode(value) : null
    const displayMode = detectedMode ?? mode
    const paletteSuggestion = palette.suggestion(value)
    const separatorWidth = Math.max(
      columns - 1,
      TUI_WELCOME.SEPARATOR_MIN_WIDTH,
    )

    return (
      <Box flexDirection="column">
        {mentions.showMentionPalette && (
          <FileMentionPalette
            files={mentions.mentionFiles}
            selectedIndex={mentions.mentionIndex}
            query={mentions.atQuery ?? ""}
          />
        )}
        <Text color="gray" dimColor>
          {"─".repeat(separatorWidth)}
        </Text>
        <Box paddingX={1}>
          <Text color={resolveModeColor(displayMode)} bold>
            ❯
          </Text>
          <Text color="gray"> {displayMode} </Text>
          <Text>
            {value}
            {paletteSuggestion.length > 0 ? (
              <Text color="gray" dimColor>
                {paletteSuggestion}
              </Text>
            ) : null}
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
