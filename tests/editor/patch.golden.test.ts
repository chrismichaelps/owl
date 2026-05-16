/** @Owl.Tests.Editor.PatchGolden - Golden diff formatting regressions */
import { describe, expect, it } from "vitest"
import {
  countChangedLines,
  formatSideBySideDiff,
  formatUnifiedDiff,
  getPatchFromContents,
} from "../../src/editor/utils/patch.js"

const OLD_CONTENT = "export const answer = 41\nexport const ok = true\n"
const NEW_CONTENT = "export const answer = 42\nexport const ok = true\n"

describe("patch golden formatting", () => {
  it("formats a stable unified diff", () => {
    const hunks = getPatchFromContents(
      "src/example.ts",
      OLD_CONTENT,
      NEW_CONTENT,
    )

    expect(formatUnifiedDiff("src/example.ts", hunks)).toBe(
      [
        "--- a/src/example.ts",
        "+++ b/src/example.ts",
        "@@ -1,2 +1,2 @@",
        "-export const answer = 41",
        "+export const answer = 42",
        " export const ok = true",
      ].join("\n"),
    )
  })

  it("counts changed lines from generated hunks", () => {
    const hunks = getPatchFromContents(
      "src/example.ts",
      OLD_CONTENT,
      NEW_CONTENT,
    )

    expect(countChangedLines(hunks)).toEqual({ added: 1, removed: 1 })
  })

  it("formats a stable side-by-side diff header and paired row", () => {
    const hunks = getPatchFromContents(
      "src/example.ts",
      OLD_CONTENT,
      NEW_CONTENT,
    )
    const rendered = formatSideBySideDiff("src/example.ts", hunks)

    expect(rendered).toContain("Side-by-side diff: src/example.ts")
    expect(rendered).toContain("@@ -1,2 +1,2 @@")
    expect(rendered).toContain("- export const answer = 41")
    expect(rendered).toContain("+ export const answer = 42")
  })
})
