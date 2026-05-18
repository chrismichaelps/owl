/** @Owl.Tests.Commands.Resume - Session resume command tests */
import { describe, expect, it } from "vitest"
import { Chunk, Effect } from "effect"
import {
  SessionMemory,
  SessionMemoryLive,
} from "../../src/engine/memory/index.js"
import { makeResumeCommand } from "../../src/commands/management/resume.js"

const run = <A>(effect: Effect.Effect<A, unknown, SessionMemory>) =>
  Effect.runPromise(effect.pipe(Effect.provide(SessionMemoryLive)))

describe("makeResumeCommand", () => {
  it("shows the active Session id when no id is provided", async () => {
    const output = await run(
      Effect.gen(function* () {
        const memory = yield* SessionMemory
        yield* memory.startSession("sess-active")
        const command = makeResumeCommand(memory)
        const result = yield* command.execute([])
        return result.output
      }),
    )

    expect(output).toBe("Active Session: sess-active")
  })

  it("resumes the requested Session id", async () => {
    const output = await run(
      Effect.gen(function* () {
        const memory = yield* SessionMemory
        const command = makeResumeCommand(memory)
        const result = yield* command.execute(["sess-target"])
        const active = yield* memory.getSessionId()
        return result.output + "\n" + active
      }),
    )

    expect(output).toBe("Active Session: sess-target\nsess-target")
  })

  it("preserves existing turns when switching Sessions", async () => {
    const turns = await run(
      Effect.gen(function* () {
        const memory = yield* SessionMemory
        yield* memory.startSession("sess-a")
        yield* memory.recordTurn({
          taskId: "task-1",
          prompt: "hello",
          response: "world",
          tokensUsed: 2,
          timestamp: "2026-05-18T00:00:00.000Z",
        })
        const command = makeResumeCommand(memory)
        yield* command.execute(["sess-b"])
        yield* command.execute(["sess-a"])
        return yield* memory.getTurns()
      }),
    )

    expect(Chunk.size(turns)).toBe(1)
  })
})
