/** @Owl.Tests.Core.Schema - Core schema validation tests */
import { describe, it, expect } from "vitest"
import { Schema } from "effect"
import {
  ModeSchema,
  MessageSchema,
  TaskSchema,
  TokenUsageSchema,
  type Mode,
} from "../../src/core/schema/index.js"

describe("core schemas", () => {
  it("ModeSchema validates known modes", () => {
    const decode = Schema.decodeUnknownSync(ModeSchema)
    expect(decode("standard")).toBe("standard")
    expect(decode("deep")).toBe("deep")
    expect(decode("quick")).toBe("quick")
    expect(decode("economy")).toBe("economy")
    expect(decode("god")).toBe("god")
  })

  it("ModeSchema rejects unknown modes", () => {
    const decode = Schema.decodeUnknownEither(ModeSchema)
    expect(decode("unknown")._tag).toBe("Left")
  })

  it("MessageSchema validates a user message", () => {
    const msg = Schema.decodeUnknownSync(MessageSchema)({
      role: "user",
      content: "Hello Owl",
      timestamp: "2026-05-12T00:00:00Z",
    })
    expect(msg.role).toBe("user")
    expect(msg.content).toBe("Hello Owl")
  })

  it("TaskSchema validates a task", () => {
    const task = Schema.decodeUnknownSync(TaskSchema)({
      id: "task-001",
      prompt: "Refactor the auth module",
      mode: "standard",
      createdAt: "2026-05-12T00:00:00Z",
    })
    expect(task.id).toBe("task-001")
    expect(task.mode).toBe("standard")
  })

  it("TokenUsageSchema validates usage", () => {
    const usage = Schema.decodeUnknownSync(TokenUsageSchema)({
      inputTokens: 1200,
      outputTokens: 450,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
    })
    expect(usage.inputTokens).toBe(1200)
  })

  it("types derive from schemas", () => {
    const mode: Mode = "economy"
    expect(mode).toBe("economy")
  })
})
