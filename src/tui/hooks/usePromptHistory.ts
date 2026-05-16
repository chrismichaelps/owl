/**
 * @Owl.TUI.Hooks.PromptHistory - Persistent cross-session prompt history navigation
 *
 * Extends the in-memory Up/Down navigation with persistence to ~/.owl/history.jsonl.
 * On mount, loads the last 200 prompts from disk for the current project.
 * On submit, appends to disk (fire-and-forget, never blocks the UI).
 *
 * Navigation:
 * - Up arrow: Navigate to previous entry (newest-first)
 * - Down arrow: Navigate to next entry or restore current input
 * - Enter: Push to history, reset navigation index, write to disk
 *
 * @example
 * const { push, up, down, reset } = usePromptHistory(process.cwd())
 */
import { useState, useCallback, useRef, useEffect } from "react"
import { Chunk, Option } from "effect"
import { TUI_HISTORY_CONSTANTS } from "../../core/constants/index.js"
import { loadHistory, appendHistory } from "../history/index.js"

/** @Owl.TUI.Hooks.PromptHistory.Result - Hook return value */
export interface UsePromptHistoryResult {
  readonly historyIndex: number
  readonly push: (entry: string) => void
  readonly up: (currentInput: string) => string
  readonly down: () => string
  readonly reset: () => void
}

/**
 * @Owl.TUI.Hooks.PromptHistory.Hook - Persistent prompt history navigation hook
 *
 * @param projectRoot - Project root for scoping history (default: process.cwd())
 */
export function usePromptHistory(
  projectRoot: string = process.cwd(),
): UsePromptHistoryResult {
  const [historyIndex, setHistoryIndex] = useState(-1)
  // In-memory ring buffer; index 0 = most recent
  const historyRef = useRef<Chunk.Chunk<string>>(Chunk.empty())
  const indexRef = useRef(-1)

  // Load persisted history on mount (newest-first from disk)
  useEffect(() => {
    void loadHistory(projectRoot)
      .then((entries) => {
        if (entries.length > 0) {
          historyRef.current = Chunk.fromIterable(entries)
        }
      })
      .catch(() => undefined)
  }, [projectRoot])

  /** Push new entry to history and persist to disk */
  const push = useCallback(
    (entry: string) => {
      const trimmed = entry.trim()
      if (trimmed.length === 0) return

      // Filter consecutive duplicates in memory
      const latest = Option.getOrUndefined(Chunk.get(historyRef.current, 0))
      if (latest !== trimmed) {
        historyRef.current = Chunk.take(
          Chunk.prepend(historyRef.current, trimmed),
          TUI_HISTORY_CONSTANTS.MAX_ENTRIES,
        )
      }
      indexRef.current = -1
      setHistoryIndex(-1)

      // Persist to disk (fire-and-forget)
      appendHistory(trimmed, projectRoot)
    },
    [projectRoot],
  )

  /** Navigate up: returns previous history entry */
  const up = useCallback((currentInput: string): string => {
    const history = historyRef.current
    const size = Chunk.size(history)
    if (size === 0) return currentInput
    const current = indexRef.current
    const next = current === -1 ? 0 : Math.min(current + 1, size - 1)
    indexRef.current = next
    setHistoryIndex(next)
    return Option.getOrElse(Chunk.get(history, next), () => currentInput)
  }, [])

  /** Navigate down: returns next entry or empty string */
  const down = useCallback((): string => {
    const current = indexRef.current
    if (current <= 0) {
      indexRef.current = -1
      setHistoryIndex(-1)
      return ""
    }
    const next = current - 1
    indexRef.current = next
    setHistoryIndex(next)
    return Option.getOrElse(Chunk.get(historyRef.current, next), () => "")
  }, [])

  /** Reset navigation to current input (exit history mode) */
  const reset = useCallback(() => {
    indexRef.current = -1
    setHistoryIndex(-1)
  }, [])

  return { historyIndex, push, up, down, reset }
}
