/**
 * @Owl.TUI.Hooks.PromptHistory - In-memory up/down arrow prompt history navigation
 *
 * Custom React hook for CLI-style command history.
 * Features:
 * - Up arrow: Navigate to previous entry
 * - Down arrow: Navigate to next entry (or clear input)
 * - Enter: Push to history, reset navigation index
 * - Duplicates filtered (consecutive only)
 *
 * @example
 * const { push, up, down, reset } = usePromptHistory()
 *
 * // On key press
 * if (key.upArrow) setValue(up(value))
 * if (key.downArrow) setValue(down())
 * if (key.return) { push(value); reset() }
 */
import { useState, useCallback, useRef } from "react"

/** @Owl.TUI.Hooks.PromptHistory.Result - Hook return value */
export interface UsePromptHistoryResult {
  readonly historyIndex: number
  readonly push: (entry: string) => void
  readonly up: (currentInput: string) => string
  readonly down: () => string
  readonly reset: () => void
}

/** @Owl.TUI.Hooks.PromptHistory.Hook - Prompt history navigation hook */
export function usePromptHistory(): UsePromptHistoryResult {
  const [historyIndex, setHistoryIndex] = useState(-1)
  const historyRef = useRef<string[]>([])
  const indexRef = useRef(-1)

  /** Push new entry to history (filters consecutive duplicates) */
  const push = useCallback((entry: string) => {
    const trimmed = entry.trim()
    if (trimmed.length === 0) return
    const prev = historyRef.current
    if (prev[prev.length - 1] === trimmed) return
    historyRef.current = [...prev, trimmed]
    indexRef.current = -1
    setHistoryIndex(-1)
  }, [])

  /** Navigate up: returns previous history entry */
  const up = useCallback((currentInput: string): string => {
    const history = historyRef.current
    if (history.length === 0) return currentInput
    const current = indexRef.current
    const next = current === -1 ? history.length - 1 : Math.max(0, current - 1)
    indexRef.current = next
    setHistoryIndex(next)
    return history[next] ?? currentInput
  }, [])

  /** Navigate down: returns next entry or empty string */
  const down = useCallback((): string => {
    const history = historyRef.current
    const current = indexRef.current
    if (current === -1) return ""
    const next = current + 1
    if (next >= history.length) {
      indexRef.current = -1
      setHistoryIndex(-1)
      return ""
    }
    indexRef.current = next
    setHistoryIndex(next)
    return history[next] ?? ""
  }, [])

  /** Reset navigation to current input (exit history mode) */
  const reset = useCallback(() => {
    indexRef.current = -1
    setHistoryIndex(-1)
  }, [])

  return { historyIndex, push, up, down, reset }
}
