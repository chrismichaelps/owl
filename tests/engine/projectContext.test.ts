/**
 * @Owl.Engine.ProjectContext.Tests - Startup context loading regression coverage
 */
import { mkdir, mkdtemp, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { Chunk, Data, Effect, Equal } from "effect"
import { describe, expect, it } from "vitest"
import { PROJECT_CONTEXT_CONSTANTS } from "../../src/core/constants/index.js"
import { loadProjectContext } from "../../src/engine/context/projectContext.js"

const makeProjectRoot = (): Promise<string> =>
  mkdtemp(join(tmpdir(), "owl-project-context-"))

describe("loadProjectContext", () => {
  it("loads project instruction files into a stable Data struct", async () => {
    const projectRoot = await makeProjectRoot()
    const claudeDir = join(
      projectRoot,
      PROJECT_CONTEXT_CONSTANTS.CLAUDE_CONFIG_DIR,
    )
    await mkdir(claudeDir)
    await writeFile(
      join(projectRoot, PROJECT_CONTEXT_CONSTANTS.INSTRUCTIONS_FILE),
      "Project rule",
    )
    await writeFile(
      join(claudeDir, PROJECT_CONTEXT_CONSTANTS.INSTRUCTIONS_FILE),
      "Nested rule",
    )

    const ctx = await Effect.runPromise(loadProjectContext(projectRoot))

    expect(ctx.projectRoot).toBe(projectRoot)
    expect(ctx.claudeMd).toContain("Project rule")
    expect(ctx.claudeMd).toContain("Nested rule")
    expect(Equal.equals(ctx, Data.struct({ ...ctx }))).toBe(true)
  })

  it("returns null git status outside a git repository", async () => {
    const projectRoot = await makeProjectRoot()

    const ctx = await Effect.runPromise(loadProjectContext(projectRoot))

    expect(ctx.gitStatus).toBeNull()
  })

  it("truncates oversized project instructions deterministically", async () => {
    const projectRoot = await makeProjectRoot()
    const longInstruction = Chunk.toReadonlyArray(
      Chunk.make(
        "x".repeat(PROJECT_CONTEXT_CONSTANTS.MAX_INSTRUCTIONS_CHARS),
        "overflow",
      ),
    ).join("")
    await writeFile(
      join(projectRoot, PROJECT_CONTEXT_CONSTANTS.INSTRUCTIONS_FILE),
      longInstruction,
    )

    const ctx = await Effect.runPromise(loadProjectContext(projectRoot))

    expect(ctx.claudeMd).toContain(PROJECT_CONTEXT_CONSTANTS.TRUNCATED_MARKER)
  })
})
