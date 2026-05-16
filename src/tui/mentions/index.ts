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
import { Chunk, Effect, HashMap, HashSet, Option } from "effect"
import { readFile } from "node:fs/promises"
import { extname } from "node:path"
import { MENTION_CONSTANTS } from "../../core/constants/index.js"
import { resolveProjectPath } from "../../core/path/index.js"

/**
 * Image extensions that trigger vision encoding.
 * Exported so the FileMentionPalette can share the same set without duplication.
 */
export const IMAGE_EXTENSIONS: HashSet.HashSet<string> = HashSet.fromIterable([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
])

/** MIME type map for supported image extensions */
const IMAGE_MIME: HashMap.HashMap<string, string> = HashMap.fromIterable([
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".gif", "image/gif"],
  [".webp", "image/webp"],
])

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
  const matches = Chunk.fromIterable(prompt.matchAll(AT_PATTERN))
  if (Chunk.isEmpty(matches)) {
    return { expanded: prompt, files: [], errors: [] }
  }

  let files = Chunk.empty<string>()
  let errors = Chunk.empty<string>()
  let fileBlocks = Chunk.empty<string>()
  let totalTextBytes = 0
  let seen = HashSet.empty<string>()

  for (const match of matches) {
    const rawPath = match[1] ?? ""
    if (HashSet.has(seen, rawPath)) continue
    seen = HashSet.add(seen, rawPath)

    const resolved = await Effect.runPromiseExit(
      resolveProjectPath(projectRoot, rawPath, "mention-expansion"),
    )
    if (resolved._tag === "Failure") {
      errors = Chunk.append(errors, `${rawPath}: path escapes project root`)
      continue
    }

    const absPath = resolved.value
    const ext = extname(rawPath).toLowerCase()
    const isImage = HashSet.has(IMAGE_EXTENSIONS, ext)

    try {
      if (isImage) {
        const buf = await readFile(absPath)
        if (buf.byteLength > MENTION_CONSTANTS.MAX_IMAGE_BYTES) {
          errors = Chunk.append(
            errors,
            `${rawPath}: image too large (${String(Math.round(buf.byteLength / MENTION_CONSTANTS.DISPLAY_UNIT_BYTES))}KB, max ${MENTION_CONSTANTS.MAX_IMAGE_LABEL})`,
          )
          continue
        }
        const mime = Option.getOrElse(
          HashMap.get(IMAGE_MIME, ext),
          () => "image/png",
        )
        const data = buf.toString("base64")
        files = Chunk.append(files, rawPath)
        fileBlocks = Chunk.append(
          fileBlocks,
          `<owl:image path="${rawPath}" mime="${mime}" data="${data}"/>`,
        )
      } else {
        const content = await readFile(absPath, "utf-8")
        const bytes = Buffer.byteLength(content, "utf-8")

        if (bytes > MENTION_CONSTANTS.MAX_FILE_BYTES) {
          errors = Chunk.append(
            errors,
            `${rawPath}: too large (${String(Math.round(bytes / MENTION_CONSTANTS.DISPLAY_UNIT_BYTES))}KB, max ${MENTION_CONSTANTS.MAX_FILE_LABEL})`,
          )
          continue
        }

        if (totalTextBytes + bytes > MENTION_CONSTANTS.MAX_TOTAL_TEXT_BYTES) {
          errors = Chunk.append(
            errors,
            `${rawPath}: total @mention budget exceeded (max ${MENTION_CONSTANTS.MAX_TOTAL_TEXT_LABEL})`,
          )
          break
        }

        totalTextBytes += bytes
        files = Chunk.append(files, rawPath)
        fileBlocks = Chunk.append(
          fileBlocks,
          `<file path="${rawPath}">\n${content}\n</file>`,
        )
      }
    } catch {
      errors = Chunk.append(errors, `${rawPath}: file not found`)
    }
  }

  if (Chunk.isEmpty(fileBlocks)) {
    return {
      expanded: prompt,
      files: Chunk.toReadonlyArray(files),
      errors: Chunk.toReadonlyArray(errors),
    }
  }

  const expanded =
    Chunk.toReadonlyArray(fileBlocks).join("\n\n") + "\n\n" + prompt
  return {
    expanded,
    files: Chunk.toReadonlyArray(files),
    errors: Chunk.toReadonlyArray(errors),
  }
}
