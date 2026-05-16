/** @Owl.Tests.Commands.Add - Context file loading containment tests */
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { Cause, Effect, Exit } from "effect"
import { COMMAND_CONSTANTS } from "../../src/core/constants/index.js"
import {
  ContextManager,
  ContextManagerLive,
} from "../../src/engine/context/index.js"
import { makeAddCommand } from "../../src/commands/editing/add.js"

const makeProjectRoot = (): Promise<string> =>
  mkdtemp(path.join(os.tmpdir(), "owl-add-"))

describe("makeAddCommand", () => {
  it("adds project files to ContextManager", async () => {
    const projectRoot = await makeProjectRoot()
    try {
      await mkdir(path.join(projectRoot, "src"), { recursive: true })
      await writeFile(
        path.join(projectRoot, "src", "a.ts"),
        "export const a = 1\n",
      )

      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const context = yield* ContextManager
          const command = makeAddCommand(context, projectRoot)
          const output = yield* command.execute(["src/a.ts"])
          const messages = yield* context.getMessages()
          return { output: output.output, messages }
        }).pipe(Effect.provide(ContextManagerLive)),
      )

      expect(result.output).toContain("Added 1 file")
      expect(result.messages).toHaveLength(1)
      expect(result.messages[0]?.content).toContain('<file path="src/a.ts">')
      expect(result.messages[0]?.content).toContain("export const a = 1")
    } finally {
      await rm(projectRoot, { recursive: true, force: true })
    }
  })

  it("rejects files outside the project root", async () => {
    const projectRoot = await makeProjectRoot()
    const outsidePath = path.join(path.dirname(projectRoot), "outside.txt")
    try {
      await writeFile(outsidePath, "do not leak\n")

      const exit = await Effect.runPromiseExit(
        Effect.gen(function* () {
          const context = yield* ContextManager
          const command = makeAddCommand(context, projectRoot)
          return yield* command.execute(["../outside.txt"])
        }).pipe(Effect.provide(ContextManagerLive)),
      )

      expect(Exit.isFailure(exit)).toBe(true)
      if (Exit.isFailure(exit)) {
        const error = Cause.failureOption(exit.cause)
        expect(error._tag).toBe("Some")
        if (error._tag === "Some") {
          expect(error.value.reason).toContain("escapes the project root")
        }
      }
    } finally {
      await rm(projectRoot, { recursive: true, force: true })
      await rm(outsidePath, { force: true })
    }
  })

  it("rejects files above the configured file size limit", async () => {
    const projectRoot = await makeProjectRoot()
    try {
      const bigFile = path.join(projectRoot, "big.txt")
      await writeFile(
        bigFile,
        "x".repeat(COMMAND_CONSTANTS.ADD_MAX_FILE_BYTES + 1),
      )

      const exit = await Effect.runPromiseExit(
        Effect.gen(function* () {
          const context = yield* ContextManager
          const command = makeAddCommand(context, projectRoot)
          return yield* command.execute(["big.txt"])
        }).pipe(Effect.provide(ContextManagerLive)),
      )

      expect(Exit.isFailure(exit)).toBe(true)
    } finally {
      await rm(projectRoot, { recursive: true, force: true })
    }
  })
})
