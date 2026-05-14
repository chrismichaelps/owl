/**
 * @Owl.Editor.Utils.Strings - Text normalization for TLI
 *
 * Handles LLM curly quote normalization and string matching.
 */

export const LEFT_SINGLE_CURLY = "'"
export const RIGHT_SINGLE_CURLY = "'"
export const LEFT_DOUBLE_CURLY = "\u201C"
export const RIGHT_DOUBLE_CURLY = "\u201D"

/**
 * Normalize curly quotes produced by LLMs to standard straight quotes
 * @param str - String with potential curly quotes
 * @returns String with all curly quotes converted to straight
 */
export function normalizeQuotes(str: string): string {
  return str
    .replaceAll(LEFT_SINGLE_CURLY, "'")
    .replaceAll(RIGHT_SINGLE_CURLY, "'")
    .replaceAll(LEFT_DOUBLE_CURLY, '"')
    .replaceAll(RIGHT_DOUBLE_CURLY, '"')
}

/**
 * Strip trailing whitespace from every line while preserving line endings
 * @param str - String with potential trailing whitespace
 * @returns String with trailing spaces/tabs removed
 */
export function stripTrailingWhitespace(str: string): string {
  return str.replace(/[ \t]+$/gm, "")
}

/**
 * Convert leading tabs to spaces (2 spaces per tab by default)
 * @param str - String with potential tab indentation
 * @param spacesPerTab - Number of spaces per tab (default 2)
 * @returns String with tabs replaced by spaces
 */
export function convertLeadingTabsToSpaces(
  str: string,
  spacesPerTab = 2,
): string {
  return str.replace(/^\t+/gm, (tabs) => " ".repeat(tabs.length * spacesPerTab))
}

/**
 * @Owl.Editor.Utils.Strings.Match - Result of string search operation
 */
export type MatchResult =
  | { readonly found: true; readonly count: number }
  | { readonly found: false; readonly reason: string }

/**
 * Validate that searchString appears in content the correct number of times.
 * Returns found:false if absent, or if it appears multiple times without replaceAll.
 *
 * @param content - File content to search
 * @param searchString - String to find
 * @param replaceAll - If true, accept multiple occurrences
 * @returns MatchResult with count or error reason
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
      reason: `String found ${String(occurrences)} times - use replaceAll:true or narrow the search string`,
    }
  }
  return { found: true, count: occurrences }
}

/**
 * Apply old to new string replacement with quote normalization.
 * @param content - Original file content
 * @param oldString - String to find (after normalization)
 * @param newString - String to replace with (after normalization)
 * @param replaceAll - If true, replace all occurrences
 * @returns New content with replacement applied
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
