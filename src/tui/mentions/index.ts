/**
 * @Owl.TUI.Mentions - Expand @filepath mentions in user prompts
 *
 * When a prompt contains `@path/to/file.ts`, this module reads the file
 * from disk and injects its contents as a <file> block prepended to the prompt.
 * Image files (.png, .jpg, .jpeg, .gif, .webp) are base64-encoded and emitted
 * as <owl:image> blocks which the Anthropic adapter parses into vision content blocks.
 *
 * Limits:
 * - 500 KB per text file
 * - 5 MB per image file
 * - 2 MB total across all text mentions
 *
 * @example
 * expandMentions("Review @src/foo.ts for issues", "/project")
 * // → { expanded: "<file path=\"src/foo.ts\">\n...\n</file>\n\nReview @src/foo.ts for issues", files: ["src/foo.ts"], errors: [] }
 *
 * expandMentions("What's in @screenshot.png?", "/project")
 * // → { expanded: "<owl:image path=\"screenshot.png\" mime=\"image/png\" data=\"...\"/>\n\nWhat's in @screenshot.png?", files: ["screenshot.png"], errors: [] }
 */
import { readFile } from "node:fs/promises"
import { resolve, join, extname } from "node:path"

const MAX_FILE_BYTES = 500_000 // 500 KB per text file
const MAX_IMAGE_BYTES = 5_000_000 // 5 MB per image file
const MAX_TOTAL_BYTES = 2_000_000 // 2 MB total across all text expansions

/** Image extensions that trigger vision encoding */
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp"])

/** MIME type map for supported image extensions */
const IMAGE_MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
}

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
 * `projectRoot`, wraps contents in `<file>` or `<owl:image>` XML blocks,
 * and prepends them to the prompt text. Files that are too large or not
 * found are reported in `errors` but don't fail the expansion.
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
  let totalTextBytes = 0
  const seen = new Set<string>()

  for (const match of matches) {
    const rawPath = match[1] ?? ""
    if (seen.has(rawPath)) continue
    seen.add(rawPath)

    const absPath = resolve(join(projectRoot, rawPath))
    const ext = extname(rawPath).toLowerCase()
    const isImage = IMAGE_EXTENSIONS.has(ext)

    try {
      if (isImage) {
        const buf = await readFile(absPath)
        if (buf.byteLength > MAX_IMAGE_BYTES) {
          errors.push(
            `${rawPath}: image too large (${String(Math.round(buf.byteLength / 1024))}KB, max 5MB)`,
          )
          continue
        }
        const mime = IMAGE_MIME[ext] ?? "image/png"
        const data = buf.toString("base64")
        files.push(rawPath)
        fileBlocks.push(
          `<owl:image path="${rawPath}" mime="${mime}" data="${data}"/>`,
        )
      } else {
        const content = await readFile(absPath, "utf-8")
        const bytes = Buffer.byteLength(content, "utf-8")

        if (bytes > MAX_FILE_BYTES) {
          errors.push(
            `${rawPath}: too large (${String(Math.round(bytes / 1024))}KB, max 500KB)`,
          )
          continue
        }

        if (totalTextBytes + bytes > MAX_TOTAL_BYTES) {
          errors.push(`${rawPath}: total @mention budget exceeded (max 2MB)`)
          break
        }

        totalTextBytes += bytes
        files.push(rawPath)
        fileBlocks.push(`<file path="${rawPath}">\n${content}\n</file>`)
      }
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
