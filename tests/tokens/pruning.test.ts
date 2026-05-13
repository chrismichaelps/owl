import { describe, it, expect } from "vitest"
import { Effect } from "effect"
import {
  pruneMessages,
  estimateTokens,
  extractMarkovWindow,
  shouldPrune,
} from "../../src/tokens/pruning/index.js"
import type { Message } from "../../src/core/schema/index.js"

const makeMsg = (role: "user" | "assistant", content: string): Message => ({
  role,
  content,
  timestamp: "2026-05-12T00:00:00Z",
})

describe("Second-Order Markov pruning", () => {
  it("estimateTokens approximates correctly", () => {
    const tokens = estimateTokens("Hello, world!")
    expect(tokens).toBeGreaterThan(0)
    expect(tokens).toBeLessThan(20)
  })

  it("extractMarkovWindow keeps last 2 exchange pairs", () => {
    const messages: readonly Message[] = [
      makeMsg("user", "msg1"),
      makeMsg("assistant", "resp1"),
      makeMsg("user", "msg2"),
      makeMsg("assistant", "resp2"),
      makeMsg("user", "msg3"),
      makeMsg("assistant", "resp3"),
    ]
    const window = extractMarkovWindow(messages, 2)
    expect(window.length).toBe(4)
    expect(window[0]?.content).toBe("msg2")
    expect(window[3]?.content).toBe("resp3")
  })

  it("pruneMessages reduces token count when over budget", async () => {
    const messages: readonly Message[] = Array.from({ length: 20 }, (_, i) =>
      i % 2 === 0
        ? makeMsg(
            "user",
            `This is a long user message number ${String(i)} with lots of words to fill tokens`,
          )
        : makeMsg(
            "assistant",
            `This is a long assistant response number ${String(i)} with lots of words to fill tokens`,
          ),
    )

    const result = await Effect.runPromise(
      pruneMessages(messages, { budget: 200, preserveSystemPrompt: false }),
    )

    expect(result.pruned).toBe(true)
    expect(result.messages.length).toBeLessThan(messages.length)
    expect(result.savedTokens).toBeGreaterThan(0)
  })

  it("pruneMessages leaves messages unchanged when under budget", async () => {
    const messages: readonly Message[] = [
      makeMsg("user", "hi"),
      makeMsg("assistant", "hello"),
    ]

    const result = await Effect.runPromise(
      pruneMessages(messages, { budget: 10000, preserveSystemPrompt: false }),
    )

    expect(result.pruned).toBe(false)
    expect(result.messages.length).toBe(2)
    expect(result.savedTokens).toBe(0)
  })

  it("shouldPrune detects when pruning is needed", () => {
    const over = shouldPrune(5000, 3000)
    expect(over).toBe(true)

    const under = shouldPrune(1000, 5000)
    expect(under).toBe(false)
  })
})
