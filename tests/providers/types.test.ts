/** @Owl.Tests.Providers.Types - Provider interface contract tests */
import { describe, it, expect } from "vitest"
import { Schema } from "effect"
import {
  ProviderCapabilitySchema,
  RoutingContextSchema,
  StreamChunkSchema,
  type ProviderCapability,
  type RoutingContext,
  type StreamChunk,
} from "../../src/providers/types.js"

describe("provider types", () => {
  it("ProviderCapabilitySchema validates capability", () => {
    const cap = Schema.decodeUnknownSync(ProviderCapabilitySchema)({
      providerId: "anthropic",
      modelId: "claude-opus-4-7",
      contextWindow: 200000,
      maxOutputTokens: 8192,
      inputCostPer1k: 0.015,
      outputCostPer1k: 0.075,
      supportsStreaming: true,
      reasoningDepth: "high",
      supportsFunctionCalling: true,
      supportsVision: true,
    })
    expect(cap.providerId).toBe("anthropic")
    expect(cap.reasoningDepth).toBe("high")
  })

  it("RoutingContextSchema validates routing context", () => {
    const ctx = Schema.decodeUnknownSync(RoutingContextSchema)({
      taskId: "t-001",
      mode: "standard",
      estimatedInputTokens: 5000,
      requiresReasoning: false,
      requiresVision: false,
      latencyBudgetMs: 30000,
      costBudgetUsd: 0.5,
    })
    expect(ctx.mode).toBe("standard")
    expect(ctx.estimatedInputTokens).toBe(5000)
  })

  it("StreamChunkSchema validates a text chunk", () => {
    const chunk = Schema.decodeUnknownSync(StreamChunkSchema)({
      type: "text",
      content: "Hello",
      index: 0,
    })
    expect(chunk.type).toBe("text")
    expect(chunk.content).toBe("Hello")
  })

  // Compile-time type checks — satisfy unused-vars by asserting
  it("types are assignable", () => {
    const cap: ProviderCapability = {
      providerId: "openai",
      modelId: "gpt-4o",
      contextWindow: 128000,
      maxOutputTokens: 16384,
      inputCostPer1k: 0.005,
      outputCostPer1k: 0.015,
      supportsStreaming: true,
      reasoningDepth: "high",
      supportsFunctionCalling: true,
      supportsVision: true,
    }
    const ctx: RoutingContext = {
      taskId: "t-002",
      mode: "economy",
      estimatedInputTokens: 1000,
      requiresReasoning: false,
      requiresVision: false,
      latencyBudgetMs: 10000,
    }
    const chunk: StreamChunk = { type: "stop", index: 5 }
    expect(cap.providerId).toBe("openai")
    expect(ctx.mode).toBe("economy")
    expect(chunk.type).toBe("stop")
  })
})
