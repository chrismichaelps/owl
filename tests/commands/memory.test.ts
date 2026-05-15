/** @Owl.Tests.Commands.Memory - Session memory command output tests */
import { describe, expect, it } from "vitest"
import { Effect } from "effect"
import { makeMemoryCommand } from "../../src/commands/management/memory.js"
import {
  SessionMemory,
  SessionMemoryLive,
} from "../../src/engine/memory/index.js"

const run = <A>(effect: Effect.Effect<A, never, SessionMemory>) =>
  Effect.runPromise(effect.pipe(Effect.provide(SessionMemoryLive)))

describe("makeMemoryCommand", () => {
  it("shows provider metadata when recorded on turns", async () => {
    const output = await run(
      Effect.gen(function* () {
        const memory = yield* SessionMemory
        yield* memory.startSession("s-memory-command")
        yield* memory.recordTurn({
          taskId: "task-1",
          prompt: "inspect routing",
          response: "Routed to Anthropic.",
          tokensUsed: 42,
          provider: "anthropic",
          model: "claude-opus-4",
          estimatedCostUsd: 0.002,
          latencyMs: 120,
          timestamp: "2026-05-15T20:00:00Z",
        })

        const command = makeMemoryCommand(memory)
        const result = yield* command.execute([])
        return result.output
      }),
    )

    expect(output).toContain("42 tokens")
    expect(output).toContain("anthropic")
    expect(output).toContain("claude-opus-4")
    expect(output).toContain("120ms")
    expect(output).toContain("$0.0020")
  })
})
