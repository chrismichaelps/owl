/** @Owl.Tests.Commands.Sessions - Session listing command tests */
import { Effect } from "effect"
import { describe, expect, it } from "vitest"
import { makeSessionsCommand } from "../../src/commands/management/sessions.js"
import {
  SessionMemory,
  SessionMemoryLive,
} from "../../src/engine/memory/index.js"

const run = <A>(effect: Effect.Effect<A, unknown, SessionMemory>) =>
  Effect.runPromise(effect.pipe(Effect.provide(SessionMemoryLive)))

describe("makeSessionsCommand", () => {
  it("lists known Sessions and marks the active one", async () => {
    const output = await run(
      Effect.gen(function* () {
        const memory = yield* SessionMemory
        yield* memory.startSession("sess-b")
        yield* memory.startSession("sess-a")
        const command = makeSessionsCommand(memory)
        const result = yield* command.execute([])
        return result.output
      }),
    )

    expect(output).toBe("Sessions:\n  sess-000000\n* sess-a\n  sess-b")
  })
})
