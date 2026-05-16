/**
 * @Owl.Engine.Context.ProjectContext - Load CLAUDE.md and git metadata for system prompt
 *
 * Discovers and reads CLAUDE.md files from the project hierarchy:
 *   1. ~/.owl/CLAUDE.md      — user-global rules
 *   2. <projectRoot>/CLAUDE.md — project rules (highest priority)
 *   3. <projectRoot>/.claude/CLAUDE.md
 *
 * Also collects a git snapshot (branch, status, recent commits) to give
 * the LLM situational awareness at session start.
 *
 * Design: async I/O only at session init — results are injected into the
 * FMCF system prompt once and Anthropic prompt-caches the stable prefix.
 *
 * @example
 * const ctx = await loadProjectContext("/Users/me/myproject")
 * // ctx.claudeMd  → contents of CLAUDE.md files (joined)
 * // ctx.gitStatus → "Branch: main\nStatus: (clean)\nRecent: ..."
 */
import { execFile } from "node:child_process"
import { readFile } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)

const MAX_STATUS_CHARS = 2_000
const MAX_CLAUDE_MD_CHARS = 40_000

export interface ProjectContext {
  /** Joined contents of all discovered CLAUDE.md files, or null if none found */
  readonly claudeMd: string | null
  /** Git snapshot string, or null if not a git repo */
  readonly gitStatus: string | null
  /** Absolute path to the project root */
  readonly projectRoot: string
}

/** Read a single file, return null on any error */
async function readFileSafe(filePath: string): Promise<string | null> {
  try {
    const content = await readFile(filePath, "utf8")
    return content.trim().length > 0 ? content.trim() : null
  } catch {
    return null
  }
}

/**
 * Discover and load CLAUDE.md files in priority order.
 * Later entries override earlier entries (project > global).
 */
async function loadClaudeMd(projectRoot: string): Promise<string | null> {
  const candidates = [
    join(homedir(), ".owl", "CLAUDE.md"),
    join(homedir(), ".claude", "CLAUDE.md"),
    join(projectRoot, "CLAUDE.md"),
    join(projectRoot, ".claude", "CLAUDE.md"),
  ]

  const parts: string[] = []
  for (const candidate of candidates) {
    const content = await readFileSafe(candidate)
    if (content != null) {
      parts.push(content)
    }
  }

  if (parts.length === 0) return null

  const joined = parts.join("\n\n---\n\n")
  return joined.length > MAX_CLAUDE_MD_CHARS
    ? joined.slice(0, MAX_CLAUDE_MD_CHARS) + "\n\n[...truncated]"
    : joined
}

/** Run a git command, return stdout or null on failure */
async function git(
  projectRoot: string,
  args: string[],
): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync(
      "git",
      ["--no-optional-locks", ...args],
      {
        cwd: projectRoot,
        timeout: 5_000,
      },
    )
    return stdout.trim() || null
  } catch {
    return null
  }
}

/** Collect a brief git snapshot for the system prompt */
async function loadGitStatus(projectRoot: string): Promise<string | null> {
  // Confirm it's a git repo first
  const isGit = await git(projectRoot, ["rev-parse", "--is-inside-work-tree"])
  if (isGit !== "true") return null

  const [branch, defaultBranch, status, log, userName] = await Promise.all([
    git(projectRoot, ["rev-parse", "--abbrev-ref", "HEAD"]),
    git(projectRoot, ["rev-parse", "--abbrev-ref", "origin/HEAD"]).then(
      (s) => s?.replace("origin/", "") ?? "main",
    ),
    git(projectRoot, ["status", "--short"]),
    git(projectRoot, ["log", "--oneline", "-n", "5"]),
    git(projectRoot, ["config", "user.name"]),
  ])

  const truncatedStatus =
    status != null && status.length > MAX_STATUS_CHARS
      ? status.slice(0, MAX_STATUS_CHARS) + "\n...(truncated)"
      : status

  return [
    "Git snapshot (captured at session start — not live):",
    `Current branch: ${branch ?? "unknown"}`,
    `Main branch: ${defaultBranch}`,
    ...(userName != null ? [`Git user: ${userName}`] : []),
    `Status:\n${truncatedStatus ?? "(clean)"}`,
    `Recent commits:\n${log ?? "(none)"}`,
  ].join("\n")
}

/**
 * @Owl.Engine.Context.ProjectContext.Load - Main entry point
 *
 * Runs CLAUDE.md discovery and git collection in parallel.
 * Never throws — all errors are swallowed and represented as null fields.
 *
 * @param projectRoot - Absolute path to the project root
 */
export async function loadProjectContext(
  projectRoot: string,
): Promise<ProjectContext> {
  const [claudeMd, gitStatus] = await Promise.all([
    loadClaudeMd(projectRoot).catch(() => null),
    loadGitStatus(projectRoot).catch(() => null),
  ])

  return { claudeMd, gitStatus, projectRoot }
}
