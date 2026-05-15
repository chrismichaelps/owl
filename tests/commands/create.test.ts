/** @Owl.Tests.Commands.Create - File creation command containment tests */
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { FileSystem } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"
import { describe, expect, it } from "vitest"
import { Effect, Exit } from "effect"
import { makeCreateCommand } from "../../src/commands/editing/create.js"

const makeProjectRoot = (): Promise<string> =>
  mkdtemp(path.join(os.tmpdir(), "owl-create-"))

const exists = async (filePath: string): Promise<boolean> => {
  try {
    await stat(filePath)
    return true
  } catch {
    return false
  }
}

describe("makeCreateCommand", () => {
  it("creates files inside the project root", async () => {
    const projectRoot = await makeProjectRoot()
    try {
      const output = await Effect.runPromise(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem
          const command = makeCreateCommand(fs, projectRoot)
          const result = yield* command.execute(["notes.txt", "hello"])
          return result.output
        }).pipe(Effect.provide(NodeFileSystem.layer)),
      )

      expect(output).toBe("Created notes.txt")
      expect(await exists(path.join(projectRoot, "notes.txt"))).toBe(true)
    } finally {
      await rm(projectRoot, { recursive: true, force: true })
    }
  })

  it("creates missing parent directories", async () => {
    const projectRoot = await makeProjectRoot()
    try {
      await Effect.runPromise(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem
          const command = makeCreateCommand(fs, projectRoot)
          return yield* command.execute(["nested/notes.txt", "hello"])
        }).pipe(Effect.provide(NodeFileSystem.layer)),
      )

      const content = await readFile(
        path.join(projectRoot, "nested", "notes.txt"),
        "utf8",
      )
      expect(content).toBe("hello")
    } finally {
      await rm(projectRoot, { recursive: true, force: true })
    }
  })

  it("rejects existing files instead of overwriting them", async () => {
    const projectRoot = await makeProjectRoot()
    const target = path.join(projectRoot, "notes.txt")
    try {
      await writeFile(target, "original")
      const exit = await Effect.runPromiseExit(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem
          const command = makeCreateCommand(fs, projectRoot)
          return yield* command.execute(["notes.txt", "replacement"])
        }).pipe(Effect.provide(NodeFileSystem.layer)),
      )

      expect(Exit.isFailure(exit)).toBe(true)
      expect(await readFile(target, "utf8")).toBe("original")
    } finally {
      await rm(projectRoot, { recursive: true, force: true })
    }
  })

  it("rejects paths that escape the project root", async () => {
    const projectRoot = await makeProjectRoot()
    const outsidePath = path.join(path.dirname(projectRoot), "outside.txt")
    try {
      const exit = await Effect.runPromiseExit(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem
          const command = makeCreateCommand(fs, projectRoot)
          return yield* command.execute(["../outside.txt", "bad"])
        }).pipe(Effect.provide(NodeFileSystem.layer)),
      )

      expect(Exit.isFailure(exit)).toBe(true)
      expect(await exists(outsidePath)).toBe(false)
    } finally {
      await rm(projectRoot, { recursive: true, force: true })
      await rm(outsidePath, { force: true })
    }
  })
})
