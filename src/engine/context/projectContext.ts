/**
 * @Owl.Engine.Context.ProjectContext - Effect-native startup context loader
 *
 * Discovers CLAUDE.md instructions and a compact git snapshot once at startup.
 * The resulting stable prefix is injected into the FMCF system prompt and can
 * be prompt-cached by providers.
 */
import { execFile } from "node:child_process"
import { readFile } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"
import { promisify } from "node:util"
import { Chunk, Data, Effect, Option } from "effect"
import { PROJECT_CONTEXT_CONSTANTS } from "../../core/constants/index.js"

const execFileAsync = promisify(execFile)

export type ProjectContext = Readonly<{
  readonly claudeMd: string | null
  readonly gitStatus: string | null
  readonly projectRoot: string
}>

const toNullable = <A>(option: Option.Option<A>): A | null =>
  Option.match(option, {
    onNone: () => null,
    onSome: (value) => value,
  })

const trimToOption = (content: string): Option.Option<string> => {
  const trimmed = content.trim()
  return trimmed.length > 0 ? Option.some(trimmed) : Option.none()
}

const truncate = (value: string, maxChars: number, marker: string): string =>
  value.length > maxChars ? value.slice(0, maxChars) + marker : value

const readFileSafe = (filePath: string): Effect.Effect<Option.Option<string>> =>
  Effect.tryPromise({
    try: () => readFile(filePath, "utf8"),
    catch: () => undefined,
  }).pipe(
    Effect.map(trimToOption),
    Effect.catchAll(() => Effect.succeed(Option.none())),
  )

const loadClaudeMd = (projectRoot: string): Effect.Effect<string | null> =>
  Effect.gen(function* () {
    const candidates = Chunk.make(
      join(
        homedir(),
        PROJECT_CONTEXT_CONSTANTS.OWL_CONFIG_DIR,
        PROJECT_CONTEXT_CONSTANTS.INSTRUCTIONS_FILE,
      ),
      join(
        homedir(),
        PROJECT_CONTEXT_CONSTANTS.CLAUDE_CONFIG_DIR,
        PROJECT_CONTEXT_CONSTANTS.INSTRUCTIONS_FILE,
      ),
      join(projectRoot, PROJECT_CONTEXT_CONSTANTS.INSTRUCTIONS_FILE),
      join(
        projectRoot,
        PROJECT_CONTEXT_CONSTANTS.CLAUDE_CONFIG_DIR,
        PROJECT_CONTEXT_CONSTANTS.INSTRUCTIONS_FILE,
      ),
    )

    let parts = Chunk.empty<string>()
    for (const candidate of candidates) {
      const content = yield* readFileSafe(candidate)
      if (Option.isSome(content)) {
        parts = Chunk.append(parts, content.value)
      }
    }

    if (Chunk.isEmpty(parts)) return null

    return truncate(
      Chunk.toReadonlyArray(parts).join(
        PROJECT_CONTEXT_CONSTANTS.SECTION_SEPARATOR,
      ),
      PROJECT_CONTEXT_CONSTANTS.MAX_INSTRUCTIONS_CHARS,
      PROJECT_CONTEXT_CONSTANTS.TRUNCATED_MARKER,
    )
  })

const git = (
  projectRoot: string,
  args: Chunk.Chunk<string>,
): Effect.Effect<string | null> =>
  Effect.tryPromise({
    try: () =>
      execFileAsync("git", ["--no-optional-locks", ...Chunk.toArray(args)], {
        cwd: projectRoot,
        timeout: PROJECT_CONTEXT_CONSTANTS.GIT_TIMEOUT_MS,
      }),
    catch: () => undefined,
  }).pipe(
    Effect.map(({ stdout }) => toNullable(trimToOption(stdout))),
    Effect.catchAll(() => Effect.succeed(null)),
  )

const loadGitStatus = (projectRoot: string): Effect.Effect<string | null> =>
  Effect.gen(function* () {
    const isGit = yield* git(
      projectRoot,
      Chunk.make("rev-parse", "--is-inside-work-tree"),
    )
    if (isGit !== "true") return null

    const branch = yield* git(
      projectRoot,
      Chunk.make("rev-parse", "--abbrev-ref", "HEAD"),
    )
    const defaultBranchRaw = yield* git(
      projectRoot,
      Chunk.make("rev-parse", "--abbrev-ref", "origin/HEAD"),
    )
    const status = yield* git(projectRoot, Chunk.make("status", "--short"))
    const log = yield* git(
      projectRoot,
      Chunk.make(
        "log",
        "--oneline",
        "-n",
        PROJECT_CONTEXT_CONSTANTS.GIT_RECENT_COMMIT_LIMIT,
      ),
    )
    const userName = yield* git(projectRoot, Chunk.make("config", "user.name"))

    const defaultBranch = defaultBranchRaw?.replace("origin/", "") ?? "main"
    const truncatedStatus =
      status !== null
        ? truncate(
            status,
            PROJECT_CONTEXT_CONSTANTS.MAX_STATUS_CHARS,
            PROJECT_CONTEXT_CONSTANTS.STATUS_TRUNCATED_MARKER,
          )
        : null

    return Chunk.toReadonlyArray(
      Chunk.filter(
        Chunk.make(
          "Git snapshot (captured at session start — not live):",
          `Current branch: ${branch ?? "unknown"}`,
          `Main branch: ${defaultBranch}`,
          userName !== null ? `Git user: ${userName}` : null,
          `Status:\n${truncatedStatus ?? "(clean)"}`,
          `Recent commits:\n${log ?? "(none)"}`,
        ),
        (line): line is string => line !== null,
      ),
    ).join("\n")
  })

/** @Owl.Engine.Context.ProjectContext.Load - Compose instructions and git state */
export const loadProjectContext = (
  projectRoot: string,
): Effect.Effect<ProjectContext> =>
  Effect.gen(function* () {
    const claudeMd = yield* loadClaudeMd(projectRoot)
    const gitStatus = yield* loadGitStatus(projectRoot)
    return Data.struct({ claudeMd, gitStatus, projectRoot })
  })
