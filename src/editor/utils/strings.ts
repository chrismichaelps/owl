/** @Owl.Editor.Utils.Strings - Text normalization for TLI: quote fixing, whitespace, exact matching */

/** @Owl.Editor.Utils.Strings.QuoteConstants - Curly-to-straight quote character map */
export const LEFT_SINGLE_CURLY = "‘"
export const RIGHT_SINGLE_CURLY = "’"
export const LEFT_DOUBLE_CURLY = "“"
export const RIGHT_DOUBLE_CURLY = "”"

/** Normalize curly quotes produced by LLMs to standard straight quotes */
export function normalizeQuotes(str: string): string {
  return str
    .replaceAll(LEFT_SINGLE_CURLY, "'")
    .replaceAll(RIGHT_SINGLE_CURLY, "'")
    .replaceAll(LEFT_DOUBLE_CURLY, '"')
    .replaceAll(RIGHT_DOUBLE_CURLY, '"')
}

/** Strip trailing whitespace from every line while preserving line endings */
export function stripTrailingWhitespace(str: string): string {
  return str.replace(/[ \t]+$/gm, "")
}

/** Convert leading tabs to spaces (2 spaces per tab by default) */
export function convertLeadingTabsToSpaces(
  str: string,
  spacesPerTab = 2,
): string {
  return str.replace(/^\t+/gm, (tabs) => " ".repeat(tabs.length * spacesPerTab))
}

export type MatchResult =
  | { readonly found: true; readonly count: number }
  | { readonly found: false; readonly reason: string }

/**
 * Validate that searchString appears in content the correct number of times.
 * Returns found:false if the string is absent, or if it appears multiple times
 * and replaceAll is false (ambiguous edit — must be more specific).
 */
export function findExactMatch(
  content: string,
  searchString: string,
  replaceAll = false,
): MatchResult {
  const normalizedContent = normalizeQuotes(content)
  const normalizedSearch = normalizeQuotes(searchString)

  if (normalizedSearch.length === 0) {
    return { found: false, reason: "Search string is empty" }
  }

  const parts = normalizedContent.split(normalizedSearch)
  const occurrences = parts.length - 1

  if (occurrences === 0) {
    return { found: false, reason: "String not found in file content" }
  }
  if (occurrences > 1 && !replaceAll) {
    return {
      found: false,
      reason: `String found ${String(occurrences)} times — use replaceAll:true or narrow the search string`,
    }
  }
  return { found: true, count: occurrences }
}

/**
 * Apply old→new string replacement. Always normalizes quotes first so
 * LLM-generated curly quotes match source that uses straight quotes.
 */
export function applyReplacement(
  content: string,
  oldString: string,
  newString: string,
  replaceAll = false,
): string {
  const normalizedContent = normalizeQuotes(content)
  const normalizedOld = normalizeQuotes(oldString)
  const normalizedNew = normalizeQuotes(newString)

  return replaceAll
    ? normalizedContent.replaceAll(normalizedOld, normalizedNew)
    : normalizedContent.replace(normalizedOld, normalizedNew)
}
