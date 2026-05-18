import { describe, it, expect } from "vitest"
import { Cause, Chunk, Effect } from "effect"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { SESSION_MEMORY_CONSTANTS } from "../../src/core/constants/index.js"
import { SessionMemoryValidationError } from "../../src/core/errors/index.js"
import {
  SessionMemory,
  SessionMemoryLive,
  makePersistentSessionMemoryLive,
} from "../../src/engine/memory/index.js"
import type { SessionTurn } from "../../src/engine/memory/index.js"

const run = <A, E>(eff: Effect.Effect<A, E, SessionMemory>) =>
  Effect.runPromise(eff.pipe(Effect.provide(SessionMemoryLive)))

const makeTurn = (n: number): SessionTurn => ({
  taskId: `task-${String(n)}`,
  prompt: `prompt ${String(n)}`,
  response: `response ${String(n)}`,
  tokensUsed: 100 * n,
  timestamp: new Date().toISOString(),
})

describe("SessionMemory.startSession", () => {
  it("returns a non-empty session id", async () => {
    const id = await run(
      Effect.gen(function* () {
        const mem = yield* SessionMemory
        return yield* mem.startSession()
      }),
    )
    expect(typeof id).toBe("string")
    expect(id.length).toBeGreaterThan(0)
  })

  it("generates deterministic sequential session ids", async () => {
    const ids = await run(
      Effect.gen(function* () {
        const mem = yield* SessionMemory
        const first = yield* mem.startSession()
        const second = yield* mem.startSession()
        return [first, second] as const
      }),
    )
    expect(ids).toEqual(["sess-000001", "sess-000002"])
  })

  it("accepts a provided session id", async () => {
    const id = await run(
      Effect.gen(function* () {
        const mem = yield* SessionMemory
        return yield* mem.startSession("my-custom-session")
      }),
    )
    expect(id).toBe("my-custom-session")
  })

  it("exposes the active session id via getSessionId", async () => {
    const id = await run(
      Effect.gen(function* () {
        const mem = yield* SessionMemory
        yield* mem.startSession("sess-abc")
        return yield* mem.getSessionId()
      }),
    )
    expect(id).toBe("sess-abc")
  })

  it("resumeSession preserves existing turns", async () => {
    const result = await run(
      Effect.gen(function* () {
        const mem = yield* SessionMemory
        yield* mem.startSession("s-resume")
        yield* mem.recordTurn(makeTurn(1))
        const id = yield* mem.resumeSession()
        const turns = yield* mem.getTurns()
        return { id, turns }
      }),
    )
    expect(result.id).toBe("s-resume")
    expect(Chunk.size(result.turns)).toBe(1)
  })
})

describe("SessionMemory.recordTurn / getTurns", () => {
  it("starts with no turns", async () => {
    const turns = await run(
      Effect.gen(function* () {
        const mem = yield* SessionMemory
        yield* mem.startSession("s1")
        return yield* mem.getTurns()
      }),
    )
    expect(Chunk.size(turns)).toBe(0)
  })

  it("records a turn and retrieves it", async () => {
    const turns = await run(
      Effect.gen(function* () {
        const mem = yield* SessionMemory
        yield* mem.startSession("s2")
        yield* mem.recordTurn(makeTurn(1))
        return yield* mem.getTurns()
      }),
    )
    expect(Chunk.size(turns)).toBe(1)
    expect(Chunk.unsafeGet(turns, 0).taskId).toBe("task-1")
    expect(Chunk.unsafeGet(turns, 0).prompt).toBe("prompt 1")
  })

  it("records optional runtime metadata for provider visibility", async () => {
    const turns = await run(
      Effect.gen(function* () {
        const mem = yield* SessionMemory
        yield* mem.startSession("s-meta")
        yield* mem.recordTurn({
          ...makeTurn(1),
          provider: "anthropic",
          model: "claude-opus-4",
          estimatedCostUsd: 0.003,
          latencyMs: 250,
        })
        return yield* mem.getTurns()
      }),
    )

    expect(Chunk.unsafeGet(turns, 0).provider).toBe("anthropic")
    expect(Chunk.unsafeGet(turns, 0).model).toBe("claude-opus-4")
    expect(Chunk.unsafeGet(turns, 0).estimatedCostUsd).toBe(0.003)
    expect(Chunk.unsafeGet(turns, 0).latencyMs).toBe(250)
  })

  it("records multiple turns in order", async () => {
    const turns = await run(
      Effect.gen(function* () {
        const mem = yield* SessionMemory
        yield* mem.startSession("s3")
        yield* mem.recordTurn(makeTurn(1))
        yield* mem.recordTurn(makeTurn(2))
        yield* mem.recordTurn(makeTurn(3))
        return yield* mem.getTurns()
      }),
    )
    expect(Chunk.size(turns)).toBe(3)
    expect(Chunk.toReadonlyArray(Chunk.map(turns, (t) => t.taskId))).toEqual([
      "task-1",
      "task-2",
      "task-3",
    ])
  })

  it("rejects turns with negative token counts", async () => {
    const exit = await Effect.runPromiseExit(
      Effect.gen(function* () {
        const mem = yield* SessionMemory
        yield* mem.startSession("s-invalid")
        yield* mem.recordTurn({
          ...makeTurn(1),
          tokensUsed: -1,
        })
      }).pipe(Effect.provide(SessionMemoryLive)),
    )

    expect(exit._tag).toBe("Failure")
    if (exit._tag === "Failure") {
      const failure = Cause.failureOption(exit.cause)
      expect(failure._tag).toBe("Some")
      if (failure._tag === "Some") {
        expect(failure.value).toBeInstanceOf(SessionMemoryValidationError)
      }
    }
  })

  it("evicts oldest turns beyond the retention bound", async () => {
    const turns = await run(
      Effect.gen(function* () {
        const mem = yield* SessionMemory
        yield* mem.startSession("s-bound")
        for (let i = 0; i <= SESSION_MEMORY_CONSTANTS.MAX_TURNS; i += 1) {
          yield* mem.recordTurn(makeTurn(i))
        }
        return yield* mem.getTurns()
      }),
    )

    expect(Chunk.size(turns)).toBe(SESSION_MEMORY_CONSTANTS.MAX_TURNS)
    expect(Chunk.unsafeGet(turns, 0).taskId).toBe("task-1")
  })
})

describe("SessionMemory.summarize", () => {
  it("returns a summary string mentioning turn count and total tokens", async () => {
    const summary = await run(
      Effect.gen(function* () {
        const mem = yield* SessionMemory
        yield* mem.startSession("s4")
        yield* mem.recordTurn(makeTurn(1)) // 100 tokens
        yield* mem.recordTurn(makeTurn(2)) // 200 tokens
        return yield* mem.summarize()
      }),
    )
    expect(summary).toContain("2") // turn count
    expect(summary).toContain("300") // total tokens
  })
})

describe("SessionMemory.listSessions", () => {
  it("lists known Session ids in deterministic order", async () => {
    const sessions = await run(
      Effect.gen(function* () {
        const mem = yield* SessionMemory
        yield* mem.startSession("sess-b")
        yield* mem.startSession("sess-a")
        yield* mem.resumeSession("sess-c")
        return yield* mem.listSessions()
      }),
    )

    expect(Chunk.toReadonlyArray(sessions)).toEqual([
      "sess-000000",
      "sess-a",
      "sess-b",
      "sess-c",
    ])
  })
})

describe("PersistentSessionMemory", () => {
  it("persists turns across layer re-creation", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "owl-session-"))
    const storagePath = path.join(dir, "session-memory.json")

    await Effect.runPromise(
      Effect.gen(function* () {
        const mem = yield* SessionMemory
        yield* mem.startSession("persisted-session")
        yield* mem.recordTurn(makeTurn(1))
      }).pipe(Effect.provide(makePersistentSessionMemoryLive(storagePath))),
    )

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const mem = yield* SessionMemory
        const id = yield* mem.resumeSession()
        const turns = yield* mem.getTurns()
        return { id, turns }
      }).pipe(Effect.provide(makePersistentSessionMemoryLive(storagePath))),
    )

    expect(result.id).toBe("persisted-session")
    expect(Chunk.size(result.turns)).toBe(1)
    expect(Chunk.unsafeGet(result.turns, 0).taskId).toBe("task-1")
  })
})
