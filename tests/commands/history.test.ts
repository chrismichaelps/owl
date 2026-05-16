/** @Owl.Tests.Commands.History - Session and prompt history command tests */
import { describe, expect, it } from "vitest"
import { Effect } from "effect"
import { makeHistoryCommand } from "../../src/commands/management/history.js"
import {
  SessionMemory,
  SessionMemoryLive,
} from "../../src/engine/memory/index.js"

const run = <A, E>(effect: Effect.Effect<A, E, SessionMemory>) =>
  Effect.runPromise(effect.pipe(Effect.provide(SessionMemoryLive)))

describe("makeHistoryCommand", () => {
  it("shows recent session turns", async () => {
    const output = await run(
      Effect.gen(function* () {
        const memory = yield* SessionMemory
        yield* memory.startSession("s-history-command")
        yield* memory.recordTurn({
          taskId: "task-1",
          prompt: "first prompt",
          response: "first response",
          tokensUsed: 12,
          provider: "anthropic",
          timestamp: "2026-05-16T20:00:00Z",
        })
        yield* memory.recordTurn({
          taskId: "task-2",
          prompt: "second prompt",
          response: "second response",
          tokensUsed: 24,
          provider: "ollama",
          timestamp: "2026-05-16T20:01:00Z",
        })

        const command = makeHistoryCommand(memory, "/project")
        const result = yield* command.execute(["1"])
        return result.output
      }),
    )

    expect(output).toContain("Session history")
    expect(output).toContain("#2")
    expect(output).toContain("second prompt")
    expect(output).not.toContain("first prompt")
  })

  it("shows persistent prompt history for the current project", async () => {
    const output = await run(
      Effect.gen(function* () {
        const memory = yield* SessionMemory
        const command = makeHistoryCommand(memory, "/project", () =>
          Promise.resolve(["newest prompt", "older prompt"]),
        )
        const result = yield* command.execute(["prompts"])
        return result.output
      }),
    )

    expect(output).toContain("Prompt history")
    expect(output).toContain("#1 ❯ newest prompt")
    expect(output).toContain("#2 ❯ older prompt")
  })

  it("limits persistent prompt history output", async () => {
    const output = await run(
      Effect.gen(function* () {
        const memory = yield* SessionMemory
        const command = makeHistoryCommand(memory, "/project", () =>
          Promise.resolve(["one", "two", "three"]),
        )
        const result = yield* command.execute(["prompts", "2"])
        return result.output
      }),
    )

    expect(output).toContain("#1 ❯ one")
    expect(output).toContain("#2 ❯ two")
    expect(output).not.toContain("#3 ❯ three")
  })
})
