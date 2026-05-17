/** @Owl.Tests.Commands.Init - Project instruction scaffold tests */
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { FileSystem } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"
import { Effect } from "effect"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { PROJECT_CONTEXT_CONSTANTS } from "../../src/core/constants/index.js"
import { makeInitCommand } from "../../src/commands/management/init.js"

let projectRoot = ""

const runInit = (): Promise<string> =>
  Effect.runPromise(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      const command = makeInitCommand(fs, projectRoot)
      const result = yield* command.execute([])
      return result.output
    }).pipe(Effect.provide(NodeFileSystem.layer)),
  )

beforeEach(async () => {
  projectRoot = await mkdtemp(join(tmpdir(), "owl-init-command-"))
})

afterEach(async () => {
  await rm(projectRoot, { recursive: true, force: true })
})

describe("makeInitCommand", () => {
  it("creates CLAUDE.md without leaking the absolute project root", async () => {
    const output = await runInit()
    const targetPath = join(
      projectRoot,
      PROJECT_CONTEXT_CONSTANTS.INSTRUCTIONS_FILE,
    )
    const content = await readFile(targetPath, "utf-8")

    expect(content).toContain("# CLAUDE.md")
    expect(output).toContain("Created CLAUDE.md")
    expect(output).toContain("Path: CLAUDE.md")
    expect(output).not.toContain(projectRoot)
  })

  it("does not overwrite an existing CLAUDE.md", async () => {
    const targetPath = join(
      projectRoot,
      PROJECT_CONTEXT_CONSTANTS.INSTRUCTIONS_FILE,
    )
    await writeFile(targetPath, "custom instructions\n", "utf-8")

    const output = await runInit()
    const content = await readFile(targetPath, "utf-8")

    expect(content).toBe("custom instructions\n")
    expect(output).toContain("CLAUDE.md already exists")
    expect(output).not.toContain(projectRoot)
  })
})
