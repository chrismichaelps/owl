/** @Owl.Editor.Utils.Patch - Diff primitives: structured patch generation and unified-diff formatting */
import { structuredPatch } from "diff"
import type { StructuredPatchHunk } from "diff"
import { EDITOR_CONSTANTS } from "../../core/constants/index.js"
import { convertLeadingTabsToSpaces } from "./strings.js"

export type { StructuredPatchHunk }

/** Escape & and $ before passing to the diff engine (it mishandles them) */
function escapeForDiff(s: string): string {
  return s
    .replaceAll("&", EDITOR_CONSTANTS.AMPERSAND_TOKEN)
    .replaceAll("$", EDITOR_CONSTANTS.DOLLAR_TOKEN)
}

/** Restore & and $ in the diff output lines */
function unescapeFromDiff(s: string): string {
  return s
    .replaceAll(EDITOR_CONSTANTS.AMPERSAND_TOKEN, "&")
    .replaceAll(EDITOR_CONSTANTS.DOLLAR_TOKEN, "$")
}

/**
 * Generate a structured patch between two file contents.
 * Tabs are normalised to spaces before diffing so indentation
 * changes do not inflate the hunk size.
 */
export function getPatchFromContents(
  filePath: string,
  oldContent: string,
  newContent: string,
  ignoreWhitespace = false,
): StructuredPatchHunk[] {
  const result = structuredPatch(
    filePath,
    filePath,
    escapeForDiff(convertLeadingTabsToSpaces(oldContent)),
    escapeForDiff(convertLeadingTabsToSpaces(newContent)),
    undefined,
    undefined,
    {
      ignoreWhitespace,
      context: EDITOR_CONSTANTS.DIFF_CONTEXT_LINES,
      timeout: EDITOR_CONSTANTS.DIFF_TIMEOUT_MS,
    },
  )

  if (!result) return []

  return result.hunks.map((hunk) => ({
    ...hunk,
    lines: hunk.lines.map(unescapeFromDiff),
  }))
}

/** Count added and removed lines across all hunks */
export function countChangedLines(hunks: StructuredPatchHunk[]): {
  readonly added: number
  readonly removed: number
} {
  let added = 0
  let removed = 0
  for (const hunk of hunks) {
    for (const line of hunk.lines) {
      if (line.startsWith("+")) added++
      else if (line.startsWith("-")) removed++
    }
  }
  return { added, removed }
}

/** Format hunks as a unified diff string (--- / +++ header + @@ hunks) */
export function formatUnifiedDiff(
  filePath: string,
  hunks: readonly StructuredPatchHunk[],
): string {
  if (hunks.length === 0) return ""
  const header = `--- a/${filePath}\n+++ b/${filePath}`
  const body = hunks
    .map((h) => {
      const range = `@@ -${h.oldStart},${h.oldLines} +${h.newStart},${h.newLines} @@`
      return [range, ...h.lines].join("\n")
    })
    .join("\n")
  return [header, body].join("\n")
}
