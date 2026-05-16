/** @Owl.TUI.Components.PromptInput - REPL prompt with mode prefix, history nav, slash dispatch */
import React, { memo, useCallback, useEffect, useRef, useState } from "react"
import { Box, Text, useInput, useWindowSize } from "ink"
import { COMMAND_CONSTANTS, TUI_WELCOME } from "../../core/constants/index.js"
import {
  completePaletteCommand,
  parsePaletteInput,
  rankPaletteCommands,
} from "../commands/fuzzy.js"
import type { Mode } from "../../core/schema/index.js"
import { usePromptHistory } from "../hooks/usePromptHistory.js"
import type { PaletteCommand } from "../commands/fuzzy.js"
import { FileMentionPalette } from "./FileMentionPalette.js"
import {
  listProjectFiles,
  filterFiles,
  extractAtQuery,
  completeAtMention,
} from "../mentions/files.js"
import type { ProjectFile } from "../mentions/files.js"

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
  }) => {
    // Refs hold the authoritative current value — readable inside useInput without stale closures.
    // State is only used to trigger re-renders.
    const valueRef = useRef("")
    const paletteIndexRef = useRef(0)
    const [value, setValueState] = useState("")
    const [paletteIndex, setPaletteIndexState] = useState(0)
    const { push, up, down, reset } = usePromptHistory(projectRoot)
    const { columns } = useWindowSize()

    // Keep a ref to commands so the input handler always sees the latest list
    const commandsRef = useRef(commands)
    commandsRef.current = commands

    // @file mention autocomplete state
    const allFilesRef = useRef<readonly ProjectFile[]>([])
    const [mentionFiles, setMentionFiles] = useState<readonly ProjectFile[]>([])
    const [mentionIndex, setMentionIndex] = useState(0)
    const mentionIndexRef = useRef(0)
    const mentionFilesRef = useRef<readonly ProjectFile[]>([])
    const atQuery = extractAtQuery(value)
    const showMentionPalette = atQuery !== null && !value.startsWith("/")

    // Load project file list once on mount
    useEffect(() => {
      void listProjectFiles(projectRoot ?? process.cwd()).then((files) => {
        allFilesRef.current = files
      })
    }, [projectRoot])

    // Recompute filtered file list whenever the @query changes
    useEffect(() => {
      if (atQuery === null) {
        setMentionFiles([])
        mentionFilesRef.current = []
        setMentionIndex(0)
        mentionIndexRef.current = 0
        return
      }
      const filtered = filterFiles(allFilesRef.current, atQuery)
      setMentionFiles(filtered)
      mentionFilesRef.current = filtered
      setMentionIndex(0)
      mentionIndexRef.current = 0
    }, [atQuery])

    const setMentionIdx = useCallback((n: number) => {
      mentionIndexRef.current = n
      setMentionIndex(n)
    }, [])

    const setValue = useCallback((next: string) => {
      valueRef.current = next
      setValueState(next)
    }, [])

    const setPaletteIndex = useCallback((next: number) => {
      paletteIndexRef.current = next
      setPaletteIndexState(next)
    }, [])

    const updateValue = useCallback(
      (next: string, nextIndex = paletteIndexRef.current): void => {
        setValue(next)
        const open = next.startsWith("/")
        const query = open ? parsePaletteInput(next).commandQuery : ""
        const matches = rankPaletteCommands(commandsRef.current, query)
        const boundedIndex =
          matches.length === 0 ? 0 : Math.min(nextIndex, matches.length - 1)
        setPaletteIndex(boundedIndex)
        onPaletteChange({ open, query, selectedIndex: boundedIndex })
      },
      [setValue, setPaletteIndex, onPaletteChange],
    )

    const closePalette = useCallback((): void => {
      setPaletteIndex(0)
      onPaletteChange({ open: false, query: "", selectedIndex: 0 })
    }, [setPaletteIndex, onPaletteChange])

    useInput(
      (input, key) => {
        if (disabled) return

        // Read from refs — never from stale state closure
        const cur = valueRef.current
        const curIdx = paletteIndexRef.current
        const atQ = extractAtQuery(cur)
        const inMention = atQ !== null && !cur.startsWith("/")

        if (input === "?" && cur.length === 0) {
          onShortcuts()
          return
        }

        // @file mention palette navigation takes priority
        if (inMention) {
          const files = mentionFilesRef.current
          if (key.upArrow) {
            setMentionIdx(Math.max(0, mentionIndexRef.current - 1))
            return
          }
          if (key.downArrow) {
            setMentionIdx(
              Math.min(files.length - 1, mentionIndexRef.current + 1),
            )
            return
          }
          if (key.tab || key.return) {
            const selected = files[mentionIndexRef.current]
            if (selected !== undefined) {
              updateValue(completeAtMention(cur, selected.path) + " ")
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
          if (cur.startsWith("/")) {
            const query = parsePaletteInput(cur).commandQuery
            const ranked = rankPaletteCommands(commandsRef.current, query)
            const nextIndex = ranked.length === 0 ? 0 : Math.max(0, curIdx - 1)
            setPaletteIndex(nextIndex)
            onPaletteChange({ open: true, query, selectedIndex: nextIndex })
            return
          }
          const entry = up(cur)
          updateValue(entry)
          return
        }

        if (key.downArrow) {
          if (cur.startsWith("/")) {
            const query = parsePaletteInput(cur).commandQuery
            const ranked = rankPaletteCommands(commandsRef.current, query)
            const nextIndex =
              ranked.length === 0 ? 0 : Math.min(ranked.length - 1, curIdx + 1)
            setPaletteIndex(nextIndex)
            onPaletteChange({ open: true, query, selectedIndex: nextIndex })
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

        if (key.tab && cur.startsWith("/")) {
          const query = parsePaletteInput(cur).commandQuery
          const selected = rankPaletteCommands(commandsRef.current, query)[
            curIdx
          ]
          if (selected !== undefined) {
            updateValue(completePaletteCommand(cur, selected.name), 0)
          }
          return
        }

        if (key.return) {
          const query = cur.startsWith("/")
            ? parsePaletteInput(cur).commandQuery
            : ""
          const ranked = cur.startsWith("/")
            ? rankPaletteCommands(commandsRef.current, query)
            : []
          const selected = ranked[curIdx]
          const submitted =
            cur.startsWith("/") && selected !== undefined
              ? completePaletteCommand(cur, selected.name)
              : cur
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
    const separatorWidth = Math.max(
      columns - 1,
      TUI_WELCOME.SEPARATOR_MIN_WIDTH,
    )

    // paletteIndex is used only to avoid unused-var warning; palette state is
    // managed by paletteIndexRef + onPaletteChange in the parent.
    void paletteIndex

    return (
      <Box flexDirection="column">
        {showMentionPalette && (
          <FileMentionPalette
            files={mentionFiles}
            selectedIndex={mentionIndex}
            query={atQuery}
          />
        )}
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
