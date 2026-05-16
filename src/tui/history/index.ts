/**
 * @Owl.TUI.History - Persistent cross-session prompt history (JSONL)
 *
 * Saves every submitted prompt to ~/.owl/history.jsonl in append-only JSONL
 * format.
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
import { Chunk, Data } from "effect"
import { JS_TYPES, TUI_HISTORY_CONSTANTS } from "../../core/constants/index.js"

const OWL_HOME = join(homedir(), TUI_HISTORY_CONSTANTS.STORAGE_DIR)
const HISTORY_FILE = join(OWL_HOME, TUI_HISTORY_CONSTANTS.STORAGE_FILE)

export interface HistoryEntry {
  readonly prompt: string
  readonly ts: number
  readonly project: string
}

export const makeHistoryEntry = (
  prompt: string,
  projectRoot: string,
  ts: number = Date.now(),
): HistoryEntry =>
  Data.struct({
    prompt: prompt.trim(),
    ts,
    project: projectRoot,
  })

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (value == null || typeof value !== JS_TYPES.OBJECT) {
    return false
  }

  const record = value as Partial<Record<keyof HistoryEntry, unknown>>
  return (
    typeof record.prompt === JS_TYPES.STRING &&
    typeof record.ts === JS_TYPES.NUMBER &&
    typeof record.project === JS_TYPES.STRING
  )
}

function parseEntry(line: string): HistoryEntry | null {
  try {
    const parsed = JSON.parse(line) as unknown
    return isHistoryEntry(parsed) ? parsed : null
  } catch {
    return null
  }
}

/** @Owl.TUI.History.Normalize - Newest-first project prompt reducer */
export function normalizeHistoryEntries(
  entries: readonly HistoryEntry[],
  projectRoot: string,
): readonly string[] {
  const state = Chunk.reduce(
    Chunk.reverse(Chunk.fromIterable(entries)),
    Data.struct({
      prompts: Chunk.empty<string>(),
      previous: undefined as string | undefined,
    }),
    (current, entry) => {
      if (
        entry.project !== projectRoot ||
        Chunk.size(current.prompts) >= TUI_HISTORY_CONSTANTS.MAX_ENTRIES ||
        current.previous === entry.prompt
      ) {
        return current
      }

      return Data.struct({
        prompts: Chunk.append(current.prompts, entry.prompt),
        previous: entry.prompt,
      })
    },
  )

  return Chunk.toReadonlyArray(state.prompts)
}

/**
 * Load history entries for a given project root (newest first).
 * Returns up to MAX_HISTORY entries. Never throws.
 */
export async function loadHistory(
  projectRoot: string,
): Promise<readonly string[]> {
  try {
    const raw = await readFile(HISTORY_FILE, "utf8")
    const entries = Chunk.reduce(
      Chunk.fromIterable(raw.split("\n")),
      Chunk.empty<HistoryEntry>(),
      (acc, line) => {
        if (line.trim().length === 0) return acc
        const entry = parseEntry(line)
        return entry === null ? acc : Chunk.append(acc, entry)
      },
    )

    return normalizeHistoryEntries(Chunk.toReadonlyArray(entries), projectRoot)
  } catch {
    return []
  }
}

/**
 * Append a prompt to the history file. Fire-and-forget (does not throw).
 */
export function appendHistory(prompt: string, projectRoot: string): void {
  const entry = makeHistoryEntry(prompt, projectRoot)
  const line = JSON.stringify(entry) + "\n"

  void (async () => {
    try {
      await mkdir(OWL_HOME, { recursive: true })
      // Create file with tight permissions if it doesn't exist
      await writeFile(HISTORY_FILE, "", {
        flag: "a",
        mode: TUI_HISTORY_CONSTANTS.FILE_MODE,
      })
      await appendFile(HISTORY_FILE, line, { encoding: "utf8" })
    } catch {
      // History write failures are silent — never block the user
    }
  })()
}
