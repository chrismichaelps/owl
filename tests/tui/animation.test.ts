/** @Owl.Tests.TUI.Animation - Terminal animation helper tests */
import { describe, expect, it } from "vitest"
import { TUI_ANIMATION } from "../../src/core/constants/index.js"
import { getPipelineState } from "../../src/tui/components/AgentPipeline.js"
import { getFrame } from "../../src/tui/hooks/useTerminalAnimation.js"

describe("getFrame", () => {
  it("selects frames cyclically", () => {
    expect(getFrame(["a", "b"], 0, "x")).toBe("a")
    expect(getFrame(["a", "b"], 1, "x")).toBe("b")
    expect(getFrame(["a", "b"], 2, "x")).toBe("a")
  })

  it("returns fallback for empty frame lists", () => {
    expect(getFrame([], 10, "fallback")).toBe("fallback")
  })
})

describe("getPipelineState", () => {
  it("marks all roles pending when no role is active", () => {
    expect(getPipelineState("Architect", null)).toBe("pending")
  })

  it("marks previous roles complete and current role active", () => {
    expect(getPipelineState("Architect", "Shadow")).toBe("complete")
    expect(getPipelineState("DNA Engineer", "Shadow")).toBe("complete")
    expect(getPipelineState("Shadow", "Shadow")).toBe("active")
    expect(getPipelineState("Forensic Guardian", "Shadow")).toBe("pending")
  })

  it("keeps the FMCF role flow in expected order", () => {
    expect(TUI_ANIMATION.FMCF_ROLE_FLOW).toEqual([
      "Architect",
      "DNA Engineer",
      "Shadow",
      "Forensic Guardian",
    ])
  })
})
