/** @Owl.Tests.Commands.NewSession - Session creation command tests */
import { Chunk, Effect } from "effect"
import { describe, expect, it } from "vitest"
import { makeNewCommand } from "../../src/commands/management/new.js"
import {
  SessionMemory,
  SessionMemoryLive,
} from "../../src/engine/memory/index.js"

const run = <A>(effect: Effect.Effect<A, unknown, SessionMemory>) =>
  Effect.runPromise(effect.pipe(Effect.provide(SessionMemoryLive)))

describe("makeNewCommand", () => {
  it("starts the next deterministic Session when no id is provided", async () => {
    const output = await run(
      Effect.gen(function* () {
        const memory = yield* SessionMemory
        const command = makeNewCommand(memory)
        const result = yield* command.execute([])
        return result.output
      }),
    )

    expect(output).toBe("New Session: sess-000001")
  })

  it("starts a Session with the requested id", async () => {
    const result = await run(
      Effect.gen(function* () {
        const memory = yield* SessionMemory
        const command = makeNewCommand(memory)
        const output = yield* command.execute(["sess-custom"])
        const active = yield* memory.getSessionId()
        return { output: output.output, active }
      }),
    )

    expect(result).toEqual({
      output: "New Session: sess-custom",
      active: "sess-custom",
    })
  })

  it("creates an empty active Session without deleting prior Sessions", async () => {
    const result = await run(
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

        const command = makeNewCommand(memory)
        yield* command.execute(["sess-b"])
        const newTurns = yield* memory.getTurns()

        yield* memory.resumeSession("sess-a")
        const oldTurns = yield* memory.getTurns()

        return {
          newTurnCount: Chunk.size(newTurns),
          oldTurnCount: Chunk.size(oldTurns),
        }
      }),
    )

    expect(result).toEqual({ newTurnCount: 0, oldTurnCount: 1 })
  })
})
