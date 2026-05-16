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
import { Chunk, Data } from "effect"
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
  return Chunk.reduce(
    Chunk.flatMap(Chunk.fromIterable(hunks), (hunk) =>
      Chunk.fromIterable(hunk.lines),
    ),
    Data.struct({ added: 0, removed: 0 }),
    (state, line) => {
      if (line.startsWith("+")) {
        return Data.struct({ added: state.added + 1, removed: state.removed })
      }

      if (line.startsWith("-")) {
        return Data.struct({ added: state.added, removed: state.removed + 1 })
      }

      return state
    },
  )
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

const truncateCell = (value: string): string =>
  value.length <= EDITOR_CONSTANTS.DIFF_SIDE_BY_SIDE_WIDTH
    ? value.padEnd(EDITOR_CONSTANTS.DIFF_SIDE_BY_SIDE_WIDTH)
    : value.slice(0, EDITOR_CONSTANTS.DIFF_SIDE_BY_SIDE_WIDTH - 1) + "…"

const formatSideBySideRow = (
  leftPrefix: string,
  left: string,
  rightPrefix: string,
  right: string,
): string =>
  leftPrefix +
  truncateCell(left) +
  EDITOR_CONSTANTS.DIFF_SIDE_BY_SIDE_SEPARATOR +
  rightPrefix +
  truncateCell(right)

const formatSideBySideHunkHeader = (hunk: StructuredPatchHunk): string =>
  "@@ -" +
  String(hunk.oldStart) +
  "," +
  String(hunk.oldLines) +
  " +" +
  String(hunk.newStart) +
  "," +
  String(hunk.newLines) +
  " @@"

const formatSideBySideLine = (
  line: string,
  next: string,
): {
  readonly row: string
  readonly consumesNext: boolean
} => {
  if (line.startsWith("-") && next.startsWith("+")) {
    return Data.struct({
      row: formatSideBySideRow("- ", line.slice(1), "+ ", next.slice(1)),
      consumesNext: true,
    })
  }

  if (line.startsWith("-")) {
    return Data.struct({
      row: formatSideBySideRow("- ", line.slice(1), "  ", ""),
      consumesNext: false,
    })
  }

  if (line.startsWith("+")) {
    return Data.struct({
      row: formatSideBySideRow("  ", "", "+ ", line.slice(1)),
      consumesNext: false,
    })
  }

  const context = line.startsWith(" ") ? line.slice(1) : line
  return Data.struct({
    row: formatSideBySideRow("  ", context, "  ", context),
    consumesNext: false,
  })
}

const formatSideBySideHunk = (
  hunk: StructuredPatchHunk,
): Chunk.Chunk<string> => {
  const state = Chunk.reduce(
    Chunk.range(0, hunk.lines.length - 1),
    Data.struct({
      rows: Chunk.make(formatSideBySideHunkHeader(hunk)),
      skipNext: false,
    }),
    (current, index) => {
      if (current.skipNext) {
        return Data.struct({ rows: current.rows, skipNext: false })
      }

      const rendered = formatSideBySideLine(
        hunk.lines[index] ?? "",
        hunk.lines[index + 1] ?? "",
      )

      return Data.struct({
        rows: Chunk.append(current.rows, rendered.row),
        skipNext: rendered.consumesNext,
      })
    },
  )

  return state.rows
}

/**
 * Format hunks as a compact side-by-side diff table.
 *
 * @param filePath - File path for the table header
 * @param hunks - StructuredPatchHunk array
 * @returns Side-by-side diff string
 */
export function formatSideBySideDiff(
  filePath: string,
  hunks: readonly StructuredPatchHunk[],
): string {
  if (hunks.length === 0) return ""
  const header = "Side-by-side diff: " + filePath
  const divider =
    "-".repeat(EDITOR_CONSTANTS.DIFF_SIDE_BY_SIDE_WIDTH + 2) +
    EDITOR_CONSTANTS.DIFF_SIDE_BY_SIDE_SEPARATOR +
    "-".repeat(EDITOR_CONSTANTS.DIFF_SIDE_BY_SIDE_WIDTH + 2)
  const body = Chunk.flatMap(Chunk.fromIterable(hunks), formatSideBySideHunk)
  return Chunk.toReadonlyArray(
    Chunk.prepend(Chunk.prepend(body, divider), header),
  ).join("\n")
}
