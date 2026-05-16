/**
 * @Owl.TUI.Mentions.Files - Project file listing for @ autocomplete
 *
 * Provides fast project file enumeration via fast-glob so the prompt
 * input can offer completions when the user types @.
 *
 * @example
 * const files = await listProjectFiles("/path/to/project")
 * const matches = filterFiles(files, "runtime")
 * // [{ path: "src/cli/runtime.ts", name: "runtime.ts" }, ...]
 */
import fg from "fast-glob"
import { basename } from "node:path"
import { Chunk, Data, Order } from "effect"
import {
  MENTION_CONSTANTS,
  MENTION_FILE_IGNORE_PATTERNS,
} from "../../core/constants/index.js"

export interface ProjectFile {
  readonly path: string // relative path from project root, e.g. "src/foo.ts"
  readonly name: string // just the filename, e.g. "foo.ts"
}

const toProjectFile = (path: string): ProjectFile =>
  Data.struct({ path, name: basename(path) })

/** Load all project files within the bounded suggestion index */
export async function listProjectFiles(
  projectRoot: string,
): Promise<readonly ProjectFile[]> {
  try {
    const paths = await fg("**/*", {
      cwd: projectRoot,
      ignore: [...MENTION_FILE_IGNORE_PATTERNS],
      onlyFiles: true,
      dot: false,
      absolute: false,
    })
    return Chunk.toReadonlyArray(
      Chunk.map(
        Chunk.take(
          Chunk.sortWith(
            Chunk.fromIterable(paths),
            (path) => path,
            Order.string,
          ),
          MENTION_CONSTANTS.PROJECT_FILE_LIMIT,
        ),
        toProjectFile,
      ),
    )
  } catch {
    return []
  }
}

/** Filter files by a query string — matches path or name, case-insensitive */
export function filterFiles(
  files: readonly ProjectFile[],
  query: string,
): readonly ProjectFile[] {
  const q = query.toLowerCase()
  const source = Chunk.fromIterable(files)
  const filtered =
    q.length === 0
      ? source
      : Chunk.filter(
          source,
          (file) =>
            file.path.toLowerCase().includes(q) ||
            file.name.toLowerCase().includes(q),
        )

  return Chunk.toReadonlyArray(
    Chunk.take(filtered, MENTION_CONSTANTS.VISIBLE_SUGGESTION_COUNT),
  )
}

const AT_QUERY_RE = /@([\w./\\-]*)$/

/** Extract the current @mention query from raw input text */
export function extractAtQuery(value: string): string | null {
  const match = AT_QUERY_RE.exec(value)
  return match !== null ? (match[1] ?? "") : null
}

/** Replace the current @query at end of value with the selected path */
export function completeAtMention(value: string, selectedPath: string): string {
  return value.replace(AT_QUERY_RE, () => `@${selectedPath}`)
}
