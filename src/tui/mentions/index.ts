/**
 * @Owl.TUI.Mentions - Expand @filepath mentions in user prompts
 *
 * When a prompt contains `@path/to/file.ts`, this module reads the file
 * from disk and injects its contents as a <file> block prepended to the prompt.
 * This mirrors the `@` mention pattern used in ref-cli / Claude Code.
 *
 * Limits:
 * - 500 KB per file
 * - 2 MB total across all mentions
 *
 * @example
 * expandMentions("Review @src/foo.ts for issues", "/project")
 * // → { expanded: "<file path=\"src/foo.ts\">\n...\n</file>\n\nReview @src/foo.ts for issues", files: ["src/foo.ts"], errors: [] }
 */
import { readFile } from "node:fs/promises"
import { resolve, join } from "node:path"

const MAX_FILE_BYTES = 500_000 // 500 KB per file
const MAX_TOTAL_BYTES = 2_000_000 // 2 MB total across all expansions

/** Matches @word/path.ext — handles /, -, _, ., alphanumeric */
const AT_PATTERN = /@([\w./\-\\]+\.\w+)/g

export interface MentionExpansion {
  /** Expanded prompt with file blocks prepended */
  readonly expanded: string
  /** Relative paths of files that were successfully expanded */
  readonly files: readonly string[]
  /** Error messages for files that couldn't be read */
  readonly errors: readonly string[]
}

/**
 * @Owl.TUI.Mentions.expandMentions - Async @filepath expansion
 *
 * Scans `prompt` for `@<path>` patterns, reads each file relative to
 * `projectRoot`, wraps contents in `<file>` XML blocks, and prepends
 * them to the prompt text. Files that are too large or not found are
 * reported in `errors` but don't fail the expansion.
 */
export async function expandMentions(
  prompt: string,
  projectRoot: string,
): Promise<MentionExpansion> {
  const matches = [...prompt.matchAll(AT_PATTERN)]
  if (matches.length === 0) {
    return { expanded: prompt, files: [], errors: [] }
  }

  const files: string[] = []
  const errors: string[] = []
  const fileBlocks: string[] = []
  let totalBytes = 0
  const seen = new Set<string>()

  for (const match of matches) {
    const rawPath = match[1] ?? ""
    if (seen.has(rawPath)) continue
    seen.add(rawPath)

    const absPath = resolve(join(projectRoot, rawPath))

    try {
      const content = await readFile(absPath, "utf-8")
      const bytes = Buffer.byteLength(content, "utf-8")

      if (bytes > MAX_FILE_BYTES) {
        errors.push(
          `${rawPath}: too large (${String(Math.round(bytes / 1024))}KB, max 500KB)`,
        )
        continue
      }

      if (totalBytes + bytes > MAX_TOTAL_BYTES) {
        errors.push(`${rawPath}: total @mention budget exceeded (max 2MB)`)
        break
      }

      totalBytes += bytes
      files.push(rawPath)
      fileBlocks.push(`<file path="${rawPath}">\n${content}\n</file>`)
    } catch {
      errors.push(`${rawPath}: file not found`)
    }
  }

  if (fileBlocks.length === 0) {
    return { expanded: prompt, files, errors }
  }

  const expanded = fileBlocks.join("\n\n") + "\n\n" + prompt
  return { expanded, files, errors }
}
