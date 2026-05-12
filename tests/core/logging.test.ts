import { describe, it, expect } from "vitest"
import { Effect } from "effect"
import { OwlLogger, OwlLoggerLive, withContext } from "../../src/core/logging/index.js"

describe("OwlLogger", () => {
  it("log runs without error", async () => {
    const program = Effect.gen(function* () {
      const logger = yield* OwlLogger
      yield* logger.info("test message", { module: "test" })
      return "ok"
    })

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(OwlLoggerLive)),
    )
    expect(result).toBe("ok")
  })

  it("withContext adds structured metadata", async () => {
    const program = Effect.gen(function* () {
      const logger = yield* OwlLogger
      yield* withContext(logger, { taskId: "t-001", phase: "routing" }, (l) =>
        l.info("routing task", {}),
      )
      return "ok"
    })

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(OwlLoggerLive)),
    )
    expect(result).toBe("ok")
  })
})
