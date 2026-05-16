/**
 * @Owl.TUI.Hooks.ScrollableList - Keyboard-driven scroll offset for list views
 *
 * Tracks a scroll offset into a list of items. Responds to Page Up/Down and
 * Shift+Up/Down keypresses when the list is taller than the visible viewport.
 *
 * The caller is responsible for slicing the data using `scrollOffset` and
 * clamping to the visible height.
 *
 * @example
 * const { scrollOffset, canScrollUp, canScrollDown } = useScrollableList({
 *   totalItems: turns.length,
 *   visibleRows: outputHeight,
 *   isActive: !isProcessing,
 * })
 * const visible = turns.slice(scrollOffset, scrollOffset + visibleRows)
 */
import { useState, useCallback, useRef } from "react"
import { useInput } from "ink"

interface UseScrollableListOptions {
  readonly totalItems: number
  readonly visibleRows: number
  readonly isActive: boolean
}

export interface UseScrollableListResult {
  readonly scrollOffset: number
  readonly canScrollUp: boolean
  readonly canScrollDown: boolean
  readonly scrollToBottom: () => void
}

/**
 * @Owl.TUI.Hooks.ScrollableList.Hook - Scroll state with keyboard handling
 */
export function useScrollableList({
  totalItems,
  visibleRows,
  isActive,
}: UseScrollableListOptions): UseScrollableListResult {
  const [scrollOffset, setScrollOffset] = useState(0)
  const scrollOffsetRef = useRef(0)

  const maxOffset = Math.max(0, totalItems - visibleRows)

  const setOffset = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(next, maxOffset))
      scrollOffsetRef.current = clamped
      setScrollOffset(clamped)
    },
    [maxOffset],
  )

  const scrollToBottom = useCallback(() => {
    setOffset(maxOffset)
  }, [setOffset, maxOffset])

  useInput(
    (_input, key) => {
      const cur = scrollOffsetRef.current
      const pageSize = Math.max(1, visibleRows - 1)

      if (key.pageUp || (key.shift && key.upArrow)) {
        setOffset(cur - pageSize)
        return
      }
      if (key.pageDown || (key.shift && key.downArrow)) {
        setOffset(cur + pageSize)
        return
      }
    },
    { isActive },
  )

  return {
    scrollOffset,
    canScrollUp: scrollOffset > 0,
    canScrollDown: scrollOffset < maxOffset,
    scrollToBottom,
  }
}
