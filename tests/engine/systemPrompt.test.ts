/** @Owl.Tests.Engine.SystemPrompt - FMCF system prompt tests */
import { describe, expect, it } from "vitest"
import { buildFMCFSystemPrompt } from "../../src/engine/context/systemPrompt.js"

describe("buildFMCFSystemPrompt", () => {
  it("builds the base FMCF prompt without project context", () => {
    const prompt = buildFMCFSystemPrompt()

    expect(prompt).toContain("FMCF v3.5")
    expect(prompt).toContain("Hash-First Hard-Lock")
    expect(prompt).not.toContain("Project Instructions")
  })

  it("appends project instructions and git status deterministically", () => {
    const prompt = buildFMCFSystemPrompt({
      claudeMd: "Use strict Effect architecture.",
      gitStatus: "## Git Status\nclean",
      projectRoot: "/workspace/owl",
    })

    expect(prompt).toContain("## Project Instructions (from CLAUDE.md)")
    expect(prompt).toContain("Use strict Effect architecture.")
    expect(prompt).toContain("## Project State")
    expect(prompt).toContain("## Git Status\nclean")
    expect(prompt.indexOf("Project Instructions")).toBeLessThan(
      prompt.indexOf("Project State"),
    )
  })
})
