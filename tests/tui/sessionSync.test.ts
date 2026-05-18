/** @Owl.Tests.TUI.SessionSync - Session turn projection tests */
import { Chunk } from "effect"
import { describe, expect, it } from "vitest"
import { sessionTurnsToConversationTurns } from "../../src/tui/session/sync.js"

describe("sessionTurnsToConversationTurns", () => {
  it("preserves Session turn order and core content", () => {
    const turns = sessionTurnsToConversationTurns(
      Chunk.make(
        {
          taskId: "task-1",
          prompt: "first",
          response: "one",
          tokensUsed: 3,
          timestamp: "2026-05-18T00:00:00.000Z",
        },
        {
          taskId: "task-2",
          prompt: "second",
          response: "two",
          tokensUsed: 5,
          timestamp: "2026-05-18T00:01:00.000Z",
        },
      ),
    )

    expect(turns[0]).toMatchObject({ id: "task-1", prompt: "first" })
    expect(turns[1]).toMatchObject({ id: "task-2", prompt: "second" })
  })

  it("uses runtime metadata when present", () => {
    const [turn] = sessionTurnsToConversationTurns(
      Chunk.make({
        taskId: "task-meta",
        prompt: "prompt",
        response: "response",
        tokensUsed: 13,
        provider: "anthropic",
        model: "claude-sonnet",
        latencyMs: 42,
        estimatedCostUsd: 0.001,
        timestamp: "2026-05-18T00:00:00.000Z",
      }),
    )

    expect(turn).toMatchObject({
      provider: "anthropic",
      model: "claude-sonnet",
      latencyMs: 42,
      inputTokens: 13,
      estimatedCostUsd: 0.001,
    })
  })
})
