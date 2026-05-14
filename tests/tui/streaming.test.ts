import { describe, it, expect } from "vitest"
import { owlReducer, INITIAL_STATE } from "../../src/tui/state.js"

describe("owlReducer streaming", () => {
  it("INITIAL_STATE has empty streamingContent", () => {
    expect(INITIAL_STATE.streamingContent).toBe("")
  })

  it("APPEND_STREAM appends text to streamingContent", () => {
    const s1 = owlReducer(INITIAL_STATE, {
      type: "APPEND_STREAM",
      text: "Hello ",
    })
    const s2 = owlReducer(s1, { type: "APPEND_STREAM", text: "world" })
    expect(s2.streamingContent).toBe("Hello world")
  })

  it("APPEND_STREAM does not mutate other state fields", () => {
    const s1 = owlReducer(INITIAL_STATE, { type: "APPEND_STREAM", text: "x" })
    expect(s1.status).toBe("idle")
    expect(s1.turns).toEqual([])
  })

  it("CLEAR_STREAM resets streamingContent to empty string", () => {
    const withContent = owlReducer(INITIAL_STATE, {
      type: "APPEND_STREAM",
      text: "partial",
    })
    const cleared = owlReducer(withContent, { type: "CLEAR_STREAM" })
    expect(cleared.streamingContent).toBe("")
  })

  it("RESET clears streamingContent", () => {
    const withContent = owlReducer(INITIAL_STATE, {
      type: "APPEND_STREAM",
      text: "in progress",
    })
    const reset = owlReducer(withContent, { type: "RESET" })
    expect(reset.streamingContent).toBe("")
  })
})
