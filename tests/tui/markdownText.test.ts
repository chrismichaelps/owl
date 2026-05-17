/** @Owl.Tests.TUI.MarkdownText - Markdown rendering helper tests */
import { describe, expect, it } from "vitest"
import {
  resolveCodeLineColor,
  resolveSideBySideDiffSegments,
} from "../../src/tui/components/MarkdownText.js"
import { Chunk } from "effect"
import { MARKDOWN_BLOCK_TYPES } from "../../src/core/constants/index.js"
import { parseMarkdownBlocks } from "../../src/tui/markdown/index.js"

describe("resolveCodeLineColor", () => {
  it("renders normal code blocks in green", () => {
    expect(resolveCodeLineColor("ts", "const value = 1")).toBe("green")
  })

  it("renders diff metadata in gray", () => {
    expect(resolveCodeLineColor("diff", "--- a/src/a.ts")).toBe("gray")
    expect(resolveCodeLineColor("diff", "+++ b/src/a.ts")).toBe("gray")
  })

  it("renders diff hunks in cyan", () => {
    expect(resolveCodeLineColor("diff", "@@ -1,1 +1,1 @@")).toBe("cyan")
  })

  it("renders added and removed diff lines distinctly", () => {
    expect(resolveCodeLineColor("diff", "+const value = 2")).toBe("green")
    expect(resolveCodeLineColor("diff", "-const value = 1")).toBe("red")
  })

  it("renders side-by-side diff metadata distinctly", () => {
    expect(resolveCodeLineColor("text", "Side-by-side diff: src/a.ts")).toBe(
      "cyan",
    )
    expect(resolveCodeLineColor("text", "@@ -1,1 +1,1 @@")).toBe("cyan")
  })
})

describe("resolveSideBySideDiffSegments", () => {
  it("splits side-by-side diff rows into colored cells", () => {
    const segments = resolveSideBySideDiffSegments(
      "- const value = 1                              │ + const value = 2",
    )

    expect(segments).not.toBeNull()
    expect(segments?.leftColor).toBe("red")
    expect(segments?.rightColor).toBe("green")
  })

  it("returns null for regular code lines", () => {
    expect(resolveSideBySideDiffSegments("const value = 1")).toBeNull()
  })
})

describe("parseMarkdownBlocks", () => {
  it("parses consecutive blockquote lines as one quote block", () => {
    const blocks = Chunk.toReadonlyArray(
      parseMarkdownBlocks("> first\n> second\n\nplain"),
    )

    expect(blocks[0]).toEqual({
      type: MARKDOWN_BLOCK_TYPES.QUOTE,
      content: "first\nsecond",
    })
    expect(blocks[2]?.type).toBe(MARKDOWN_BLOCK_TYPES.TEXT)
  })
})
