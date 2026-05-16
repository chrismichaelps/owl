/** @Owl.Tests.Commands.Export - Conversation export command tests */
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { Cause, Effect, Exit } from "effect"
import { makeExportCommand } from "../../src/commands/management/export.js"
import {
  SessionMemory,
  SessionMemoryLive,
} from "../../src/engine/memory/index.js"

let projectRoot = ""

beforeEach(async () => {
  projectRoot = await mkdtemp(join(tmpdir(), "owl-export-"))
})

afterEach(async () => {
  await rm(projectRoot, { recursive: true, force: true })
})

describe("makeExportCommand", () => {
  it("exports session turns to a project-contained markdown file", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const memory = yield* SessionMemory
        yield* memory.startSession("sess-test")
        yield* memory.recordTurn({
          taskId: "task-1",
          prompt: "hello",
          response: "world",
          tokensUsed: 2,
          timestamp: "2026-05-16T12:00:00Z",
        })
        const command = makeExportCommand(memory, projectRoot)
        return yield* command.execute(["conversation"])
      }).pipe(Effect.provide(SessionMemoryLive)),
    )

    const exported = await readFile(
      join(projectRoot, "conversation.md"),
      "utf8",
    )
    expect(result.output).toBe("Exported 1 turn → conversation.md")
    expect(exported).toContain("**You:** hello")
    expect(exported).toContain("**Owl:** world")
  })

  it("uses the deterministic session id for the default filename", async () => {
    const output = await Effect.runPromise(
      Effect.gen(function* () {
        const memory = yield* SessionMemory
        yield* memory.startSession("sess-default")
        const command = makeExportCommand(memory, projectRoot)
        const result = yield* command.execute([])
        return result.output
      }).pipe(Effect.provide(SessionMemoryLive)),
    )

    expect(output).toBe("Exported 0 turns → owl-export-sess-default.md")
  })

  it("rejects export paths outside the project root", async () => {
    const exit = await Effect.runPromiseExit(
      Effect.gen(function* () {
        const memory = yield* SessionMemory
        yield* memory.startSession("sess-test")
        const command = makeExportCommand(memory, projectRoot)
        return yield* command.execute(["../outside"])
      }).pipe(Effect.provide(SessionMemoryLive)),
    )

    expect(Exit.isFailure(exit)).toBe(true)
    if (Exit.isFailure(exit)) {
      const failure = Cause.failureOption(exit.cause)
      expect(failure._tag).toBe("Some")
      if (failure._tag === "Some") {
        expect(failure.value._tag).toBe("CommandParseError")
      }
    }
  })
})
