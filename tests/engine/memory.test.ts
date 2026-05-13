import { describe, it, expect } from "vitest"
import { Effect } from "effect"
import {
  SessionMemory,
  SessionMemoryLive,
} from "../../src/engine/memory/index.js"
import type { SessionTurn } from "../../src/engine/memory/index.js"

const run = <A>(eff: Effect.Effect<A, never, SessionMemory>) =>
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
    expect(turns).toHaveLength(0)
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
    expect(turns).toHaveLength(1)
    expect(turns[0]?.taskId).toBe("task-1")
    expect(turns[0]?.prompt).toBe("prompt 1")
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
    expect(turns).toHaveLength(3)
    expect(turns.map((t) => t.taskId)).toEqual(["task-1", "task-2", "task-3"])
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
