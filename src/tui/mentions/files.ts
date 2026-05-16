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

const IGNORE_PATTERNS = [
  "node_modules/**",
  ".git/**",
  "dist/**",
  "*.lock",
  "*.log",
]
const MAX_FILES = 200

export interface ProjectFile {
  readonly path: string // relative path from project root, e.g. "src/foo.ts"
  readonly name: string // just the filename, e.g. "foo.ts"
}

/** Load all project files up to MAX_FILES */
export async function listProjectFiles(
  projectRoot: string,
): Promise<readonly ProjectFile[]> {
  try {
    const paths = await fg("**/*", {
      cwd: projectRoot,
      ignore: IGNORE_PATTERNS,
      onlyFiles: true,
      dot: false,
      absolute: false,
    })
    return paths
      .slice(0, MAX_FILES)
      .map((p) => ({ path: p, name: basename(p) }))
  } catch {
    return []
  }
}

/** Filter files by a query string — matches path or name, case-insensitive */
export function filterFiles(
  files: readonly ProjectFile[],
  query: string,
): readonly ProjectFile[] {
  if (query.length === 0) return files.slice(0, 8)
  const q = query.toLowerCase()
  return files
    .filter(
      (f) =>
        f.path.toLowerCase().includes(q) || f.name.toLowerCase().includes(q),
    )
    .slice(0, 8)
}

// Regex that matches an @ followed by word chars, dots, slashes, or backslashes at end of string
const AT_QUERY_RE = /@([\w./-]*)$/

/** Extract the current @mention query from raw input text */
export function extractAtQuery(value: string): string | null {
  const match = AT_QUERY_RE.exec(value)
  return match !== null ? (match[1] ?? "") : null
}

/** Replace the current @query at end of value with the selected path */
export function completeAtMention(value: string, selectedPath: string): string {
  return value.replace(AT_QUERY_RE, `@${selectedPath}`)
}
