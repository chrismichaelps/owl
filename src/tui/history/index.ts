/**
 * @Owl.TUI.History - Persistent cross-session prompt history (JSONL)
 *
 * Saves every submitted prompt to ~/.owl/history.jsonl in append-only JSONL
 * format, mirroring the approach used by ref-cli/history.ts.
 *
 * Each line is: { "prompt": "...", "ts": 1234567890, "project": "/path" }
 *
 * History is:
 *  - Read on TUI mount (last MAX_HISTORY entries, newest-first)
 *  - Written after each prompt submission (fire-and-forget)
 *  - Project-scoped for Up-arrow navigation (other projects visible in /history command)
 *
 * @example
 * await loadHistory(process.cwd())  // ["last prompt", "earlier prompt", ...]
 * appendHistory("my prompt", process.cwd())  // fire-and-forget write
 */
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"
import { JS_TYPES } from "../../core/constants/index.js"

const OWL_HOME = join(homedir(), ".owl")
const HISTORY_FILE = join(OWL_HOME, "history.jsonl")
const MAX_HISTORY = 200

interface HistoryEntry {
  prompt: string
  ts: number
  project: string
}

function parseEntry(line: string): HistoryEntry | null {
  try {
    const parsed = JSON.parse(line) as unknown
    if (
      parsed != null &&
      typeof parsed === JS_TYPES.OBJECT &&
      "prompt" in (parsed as object) &&
      "ts" in (parsed as object) &&
      "project" in (parsed as object) &&
      typeof (parsed as Record<string, unknown>).prompt === JS_TYPES.STRING &&
      typeof (parsed as Record<string, unknown>).ts === JS_TYPES.NUMBER &&
      typeof (parsed as Record<string, unknown>).project === JS_TYPES.STRING
    ) {
      return parsed as HistoryEntry
    }
    return null
  } catch {
    return null
  }
}

/**
 * Load history entries for a given project root (newest first).
 * Returns up to MAX_HISTORY entries. Never throws.
 */
export async function loadHistory(projectRoot: string): Promise<string[]> {
  try {
    const raw = await readFile(HISTORY_FILE, "utf8")
    const lines = raw.split("\n").filter((l) => l.trim().length > 0)

    const projectEntries: string[] = []
    // Scan newest-first (reverse the array)
    for (let i = lines.length - 1; i >= 0; i--) {
      const entry = parseEntry(lines[i] ?? "")
      if (entry?.project === projectRoot) {
        // Deduplicate consecutive identical prompts
        if (projectEntries[projectEntries.length - 1] !== entry.prompt) {
          projectEntries.push(entry.prompt)
        }
        if (projectEntries.length >= MAX_HISTORY) break
      }
    }

    return projectEntries
  } catch {
    return []
  }
}

/**
 * Append a prompt to the history file. Fire-and-forget (does not throw).
 */
export function appendHistory(prompt: string, projectRoot: string): void {
  const entry: HistoryEntry = {
    prompt: prompt.trim(),
    ts: Date.now(),
    project: projectRoot,
  }

  const line = JSON.stringify(entry) + "\n"

  void (async () => {
    try {
      await mkdir(OWL_HOME, { recursive: true })
      // Create file with tight permissions if it doesn't exist
      await writeFile(HISTORY_FILE, "", { flag: "a", mode: 0o600 })
      await appendFile(HISTORY_FILE, line, { encoding: "utf8" })
    } catch {
      // History write failures are silent — never block the user
    }
  })()
}
