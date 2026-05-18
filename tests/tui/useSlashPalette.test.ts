// @vitest-environment jsdom
/** @Owl.Tests.TUI.UseSlashPalette - Slash command palette hook tests */
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { JSDOM } from "jsdom"
import { Chunk } from "effect"
import { useSlashPalette } from "../../src/tui/hooks/useSlashPalette.js"
import type { PaletteCommand } from "../../src/tui/commands/fuzzy.js"

let dom: JSDOM
beforeAll(() => {
  dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
    url: "http://localhost",
  })
  const g = global as Record<string, unknown>
  g.window = dom.window
  g.document = dom.window.document
  g.navigator = dom.window.navigator
  g.HTMLElement = dom.window.HTMLElement
  g.Element = dom.window.Element
  g.Node = dom.window.Node
  g.Text = dom.window.Text
  g.Comment = dom.window.Comment
  g.DocumentFragment = dom.window.DocumentFragment
  g.MutationObserver = dom.window.MutationObserver
})

afterAll(() => {
  dom.window.close()
})

const commands: readonly PaletteCommand[] = [
  { name: "help", description: "Show help" },
  { name: "models", description: "Show providers" },
  { name: "memory", description: "Show memory" },
]

describe("useSlashPalette", () => {
  it("reports palette state when the value starts with slash", () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useSlashPalette(commands, onChange, Chunk.empty()),
    )

    act(() => {
      result.current.updateForValue("/mo")
    })

    expect(onChange).toHaveBeenLastCalledWith({
      open: true,
      query: "mo",
      selectedIndex: 0,
    })
  })

  it("moves selection within ranked results", () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useSlashPalette(commands, onChange, Chunk.empty()),
    )

    act(() => {
      result.current.updateForValue("/m")
    })
    act(() => {
      result.current.move("/m", 1)
    })

    expect(result.current.selectedIndex).toBe(1)
    expect(onChange).toHaveBeenLastCalledWith({
      open: true,
      query: "m",
      selectedIndex: 1,
    })
  })

  it("completes the selected command without dropping arguments", () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useSlashPalette(commands, onChange, Chunk.empty()),
    )

    let completed = ""
    act(() => {
      result.current.updateForValue("/mod opus")
      completed = result.current.completeSelected("/mod opus") ?? ""
    })

    expect(completed).toBe("/models opus")
  })

  it("closes the palette deterministically", () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useSlashPalette(commands, onChange, Chunk.empty()),
    )

    act(() => {
      result.current.updateForValue("/m")
      result.current.close()
    })

    expect(result.current.selectedIndex).toBe(0)
    expect(onChange).toHaveBeenLastCalledWith({
      open: false,
      query: "",
      selectedIndex: 0,
    })
  })
})
