/**
 * @Owl.Editor.Utils.Patch - Diff primitives: structured patch generation and unified-diff formatting
 *
 * Low-level diff utilities built on the `diff` npm package. These functions are
 * pure transformations with no side effects or dependencies on file system.
 *
 * Features:
 * - Tab normalization: Leading tabs → 2 spaces before comparing (reduces diff noise)
 * - Character escaping: & and $ escaped before diffing (special chars in diff format)
 * - Context lines: 3 lines of context around each change hunk
 *
 * @example
 * const hunks = getPatchFromContents("foo.ts", oldContent, newContent)
 * const formatted = formatUnifiedDiff("foo.ts", hunks)
 */
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
 *
 * @param filePath - File path for patch headers (appears in ---/+++ lines)
 * @param oldContent - Original content
 * @param newContent - Modified content
 * @param ignoreWhitespace - Whether to ignore whitespace differences
 * @returns Array of StructuredPatchHunk with diff lines
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

/**
 * Count added and removed lines across all hunks
 *
 * @param hunks - StructuredPatchHunk array from getPatchFromContents
 * @returns Object with `added` and `removed` counts
 */
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

/**
 * Format hunks as a unified diff string (--- / +++ header + @@ hunks)
 *
 * @param filePath - File path for headers
 * @param hunks - StructuredPatchHunk array
 * @returns Unified diff string
 */
export function formatUnifiedDiff(
  filePath: string,
  hunks: readonly StructuredPatchHunk[],
): string {
  if (hunks.length === 0) return ""
  const header = `--- a/${filePath}\n+++ b/${filePath}`
  const body = hunks
    .map((h) => {
      const range = `@@ -${String(h.oldStart)},${String(h.oldLines)} +${String(h.newStart)},${String(h.newLines)} @@`
      return [range, ...h.lines].join("\n")
    })
    .join("\n")
  return [header, body].join("\n")
}
