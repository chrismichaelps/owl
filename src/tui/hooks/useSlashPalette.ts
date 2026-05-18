/** @Owl.TUI.Hooks.SlashPalette - Slash command palette state machine */
import { useCallback, useRef, useState } from "react"
import type { Chunk } from "effect"
import { TUI_TRIGGERS } from "../../core/constants/index.js"
import {
  completePaletteCommand,
  getPaletteSuggestion,
  parsePaletteInput,
  rankPaletteCommands,
} from "../commands/fuzzy.js"
import type { PaletteCommand } from "../commands/fuzzy.js"

interface PaletteChange {
  readonly open: boolean
  readonly query: string
  readonly selectedIndex: number
}

export interface SlashPaletteState {
  readonly selectedIndex: number
  readonly updateForValue: (value: string, nextIndex?: number) => void
  readonly close: () => void
  readonly move: (value: string, delta: number) => void
  readonly selectedCommand: (value: string) => PaletteCommand | undefined
  readonly completeSelected: (value: string) => string | undefined
  readonly suggestion: (value: string) => string
}

/** @Owl.TUI.Hooks.SlashPalette.Use - Manage palette query and selection */
export const useSlashPalette = (
  commands: readonly PaletteCommand[],
  onPaletteChange: (state: PaletteChange) => void,
  pendingMutationIds: Chunk.Chunk<string>,
): SlashPaletteState => {
  const commandsRef = useRef(commands)
  commandsRef.current = commands
  const pendingMutationIdsRef = useRef(pendingMutationIds)
  pendingMutationIdsRef.current = pendingMutationIds

  const selectedIndexRef = useRef(0)
  const [selectedIndex, setSelectedIndexState] = useState(0)

  const setSelectedIndex = useCallback((next: number) => {
    selectedIndexRef.current = next
    setSelectedIndexState(next)
  }, [])

  const updateForValue = useCallback(
    (value: string, nextIndex = selectedIndexRef.current): void => {
      const open = value.startsWith(TUI_TRIGGERS.PALETTE)
      const query = open ? parsePaletteInput(value).commandQuery : ""
      const matches = rankPaletteCommands(commandsRef.current, query)
      const boundedIndex =
        matches.length === 0 ? 0 : Math.min(nextIndex, matches.length - 1)
      setSelectedIndex(boundedIndex)
      onPaletteChange({ open, query, selectedIndex: boundedIndex })
    },
    [onPaletteChange, setSelectedIndex],
  )

  const close = useCallback((): void => {
    setSelectedIndex(0)
    onPaletteChange({ open: false, query: "", selectedIndex: 0 })
  }, [onPaletteChange, setSelectedIndex])

  const selectedCommand = useCallback(
    (value: string): PaletteCommand | undefined => {
      if (!value.startsWith(TUI_TRIGGERS.PALETTE)) {
        return undefined
      }
      const query = parsePaletteInput(value).commandQuery
      return rankPaletteCommands(commandsRef.current, query)[
        selectedIndexRef.current
      ]
    },
    [],
  )

  const move = useCallback(
    (value: string, delta: number): void => {
      if (!value.startsWith(TUI_TRIGGERS.PALETTE)) {
        return
      }
      const query = parsePaletteInput(value).commandQuery
      const ranked = rankPaletteCommands(commandsRef.current, query)
      const nextIndex =
        ranked.length === 0
          ? 0
          : Math.min(
              ranked.length - 1,
              Math.max(0, selectedIndexRef.current + delta),
            )
      setSelectedIndex(nextIndex)
      onPaletteChange({ open: true, query, selectedIndex: nextIndex })
    },
    [onPaletteChange, setSelectedIndex],
  )

  const completeSelected = useCallback(
    (value: string): string | undefined => {
      const selected = selectedCommand(value)
      return selected === undefined
        ? undefined
        : completePaletteCommand(value, selected.name)
    },
    [selectedCommand],
  )

  const suggestion = useCallback(
    (value: string): string =>
      getPaletteSuggestion(
        value,
        commandsRef.current,
        selectedIndexRef.current,
        pendingMutationIdsRef.current,
      ),
    [],
  )

  return {
    selectedIndex,
    updateForValue,
    close,
    move,
    selectedCommand,
    completeSelected,
    suggestion,
  }
}
