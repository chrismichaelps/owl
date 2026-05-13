import { describe, it, expect } from "vitest"
import { Effect } from "effect"
import {
  ContextManager,
  ContextManagerLive,
} from "../../src/engine/context/index.js"
import type { Message } from "../../src/core/schema/index.js"

const now = () => new Date().toISOString()

const run = <A>(eff: Effect.Effect<A, never, ContextManager>) =>
  Effect.runPromise(eff.pipe(Effect.provide(ContextManagerLive)))

describe("ContextManager.addMessage / getMessages", () => {
  it("starts empty", async () => {
    const msgs = await run(
      Effect.gen(function* () {
        const cm = yield* ContextManager
        return yield* cm.getMessages()
      }),
    )
    expect(msgs).toHaveLength(0)
  })

  it("stores added messages in order", async () => {
    const msgs = await run(
      Effect.gen(function* () {
        const cm = yield* ContextManager
        const msg1: Message = { role: "user", content: "hello", timestamp: now() }
        const msg2: Message = { role: "assistant", content: "hi there", timestamp: now() }
        yield* cm.addMessage(msg1)
        yield* cm.addMessage(msg2)
        return yield* cm.getMessages()
      }),
    )
    expect(msgs).toHaveLength(2)
    expect(msgs[0]?.role).toBe("user")
    expect(msgs[1]?.role).toBe("assistant")
  })
})

describe("ContextManager.estimateTokens", () => {
  it("returns 0 for empty context", async () => {
    const tokens = await run(
      Effect.gen(function* () {
        const cm = yield* ContextManager
        return yield* cm.estimateTokens()
      }),
    )
    expect(tokens).toBe(0)
  })

  it("estimates tokens for a known message", async () => {
    const tokens = await run(
      Effect.gen(function* () {
        const cm = yield* ContextManager
        // "hello world" = 11 chars → round(11/4)=3 + 4 overhead = 7
        yield* cm.addMessage({ role: "user", content: "hello world", timestamp: now() })
        return yield* cm.estimateTokens()
      }),
    )
    expect(tokens).toBe(7)
  })
})

describe("ContextManager.getWindowedMessages", () => {
  it("returns all messages when under budget", async () => {
    const result = await run(
      Effect.gen(function* () {
        const cm = yield* ContextManager
        yield* cm.addMessage({ role: "user", content: "hi", timestamp: now() })
        yield* cm.addMessage({ role: "assistant", content: "hello", timestamp: now() })
        return yield* cm.getWindowedMessages(10_000)
      }),
    )
    expect(result).toHaveLength(2)
  })

  it("prunes messages when over budget", async () => {
    const result = await run(
      Effect.gen(function* () {
        const cm = yield* ContextManager
        // 10 messages × ~29 tokens each (~100 chars) = ~290 total
        for (let i = 0; i < 10; i++) {
          yield* cm.addMessage({
            role: i % 2 === 0 ? "user" : "assistant",
            content: "x".repeat(100),
            timestamp: now(),
          })
        }
        // Budget of 50 tokens forces pruning
        return yield* cm.getWindowedMessages(50)
      }),
    )
    expect(result.length).toBeLessThan(10)
  })
})

describe("ContextManager.systemPrompt", () => {
  it("starts with no system prompt", async () => {
    const prompt = await run(
      Effect.gen(function* () {
        const cm = yield* ContextManager
        return yield* cm.getSystemPrompt()
      }),
    )
    expect(prompt).toBeUndefined()
  })

  it("stores and retrieves system prompt", async () => {
    const prompt = await run(
      Effect.gen(function* () {
        const cm = yield* ContextManager
        yield* cm.setSystemPrompt("You are Owl, an AI coding agent.")
        return yield* cm.getSystemPrompt()
      }),
    )
    expect(prompt).toBe("You are Owl, an AI coding agent.")
  })
})

describe("ContextManager.clear", () => {
  it("removes all messages", async () => {
    const count = await run(
      Effect.gen(function* () {
        const cm = yield* ContextManager
        yield* cm.addMessage({ role: "user", content: "hi", timestamp: now() })
        yield* cm.addMessage({ role: "assistant", content: "hello", timestamp: now() })
        yield* cm.clear()
        const msgs = yield* cm.getMessages()
        return msgs.length
      }),
    )
    expect(count).toBe(0)
  })
})
