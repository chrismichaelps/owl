// @vitest-environment jsdom
/** @Owl.Tests.TUI.UsePromptHistory - Unit tests for the in-memory prompt history hook */
import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { JSDOM } from "jsdom"
import { usePromptHistory } from "../../src/tui/hooks/usePromptHistory.js"

// Set up a jsdom environment for bun's test runner (which defaults to node env)
let dom: JSDOM
beforeAll(() => {
  dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
    url: "http://localhost",
  })
  const g = global as Record<string, unknown>
  g["window"] = dom.window
  g["document"] = dom.window.document
  g["navigator"] = dom.window.navigator
  g["HTMLElement"] = dom.window.HTMLElement
  g["Element"] = dom.window.Element
  g["Node"] = dom.window.Node
  g["Text"] = dom.window.Text
  g["Comment"] = dom.window.Comment
  g["DocumentFragment"] = dom.window.DocumentFragment
  g["MutationObserver"] = dom.window.MutationObserver
})

afterAll(() => {
  dom.window.close()
})

describe("usePromptHistory", () => {
  it("starts with historyIndex -1", () => {
    const { result } = renderHook(() => usePromptHistory())
    expect(result.current.historyIndex).toBe(-1)
  })

  it("push adds an entry and keeps index at -1", () => {
    const { result } = renderHook(() => usePromptHistory())
    act(() => {
      result.current.push("hello world")
    })
    expect(result.current.historyIndex).toBe(-1)
  })

  it("up returns the most recent entry", () => {
    const { result } = renderHook(() => usePromptHistory())
    act(() => {
      result.current.push("first")
    })
    act(() => {
      result.current.push("second")
    })
    let val = ""
    act(() => {
      val = result.current.up("")
    })
    expect(val).toBe("second")
  })

  it("up twice returns second-most-recent entry", () => {
    const { result } = renderHook(() => usePromptHistory())
    act(() => {
      result.current.push("first")
    })
    act(() => {
      result.current.push("second")
    })
    act(() => {
      result.current.up("")
    })
    let val = ""
    act(() => {
      val = result.current.up("second")
    })
    expect(val).toBe("first")
  })

  it("up at oldest entry stays at oldest", () => {
    const { result } = renderHook(() => usePromptHistory())
    act(() => {
      result.current.push("only")
    })
    act(() => {
      result.current.up("")
    })
    let val = ""
    act(() => {
      val = result.current.up("only")
    })
    expect(val).toBe("only")
  })

  it("down after up returns empty string", () => {
    const { result } = renderHook(() => usePromptHistory())
    act(() => {
      result.current.push("a")
    })
    act(() => {
      result.current.up("")
    })
    let val = ""
    act(() => {
      val = result.current.down()
    })
    expect(val).toBe("")
  })

  it("reset brings historyIndex back to -1", () => {
    const { result } = renderHook(() => usePromptHistory())
    act(() => {
      result.current.push("x")
    })
    act(() => {
      result.current.up("")
    })
    act(() => {
      result.current.reset()
    })
    expect(result.current.historyIndex).toBe(-1)
  })

  it("does not push duplicate consecutive entries", () => {
    const { result } = renderHook(() => usePromptHistory())
    act(() => {
      result.current.push("dup")
    })
    act(() => {
      result.current.push("dup")
    })
    act(() => {
      result.current.up("")
    })
    let val = ""
    act(() => {
      val = result.current.up("dup")
    })
    expect(val).toBe("dup")
  })
})
