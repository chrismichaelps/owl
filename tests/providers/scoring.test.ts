/** @Owl.Tests.Providers.Scoring - Provider scoring algorithm tests */
import { describe, it, expect } from "vitest"
import {
  scoreProvider,
  selectBestProvider,
} from "../../src/providers/router/scoring.js"
import type {
  ProviderCapability,
  RoutingContext,
} from "../../src/providers/types.js"

/** @Owl.Tests.Providers.Scoring.Metadata - Mock model and context definitions */
const ANTHROPIC_OPUS: ProviderCapability = {
  providerId: "anthropic",
  modelId: "claude-opus-4-7",
  contextWindow: 1_000_000,
  maxOutputTokens: 128_000,
  inputCostPer1k: 0.005,
  outputCostPer1k: 0.025,
  supportsStreaming: true,
  reasoningDepth: "high",
  supportsFunctionCalling: true,
  supportsVision: true,
}

const ANTHROPIC_HAIKU: ProviderCapability = {
  providerId: "anthropic",
  modelId: "claude-haiku-4-5",
  contextWindow: 200_000,
  maxOutputTokens: 64_000,
  inputCostPer1k: 0.001,
  outputCostPer1k: 0.005,
  supportsStreaming: true,
  reasoningDepth: "low",
  supportsFunctionCalling: true,
  supportsVision: true,
}

const ECONOMY_CTX: RoutingContext = {
  taskId: "t-001",
  mode: "economy",
  estimatedInputTokens: 2000,
  requiresReasoning: false,
  requiresVision: false,
  latencyBudgetMs: 10000,
}

const DEEP_CTX: RoutingContext = {
  taskId: "t-002",
  mode: "deep",
  estimatedInputTokens: 5000,
  requiresReasoning: true,
  requiresVision: false,
  latencyBudgetMs: 60000,
}

/** @Owl.Tests.Providers.Scoring.Logic - Algorithm behavior verification */
describe("provider scoring", () => {
  it("economy mode prefers cheaper models", () => {
    const opusScore = scoreProvider(ANTHROPIC_OPUS, ECONOMY_CTX)
    const haikuScore = scoreProvider(ANTHROPIC_HAIKU, ECONOMY_CTX)
    expect(haikuScore).toBeGreaterThan(opusScore)
  })

  it("deep mode prefers high reasoning depth", () => {
    const opusScore = scoreProvider(ANTHROPIC_OPUS, DEEP_CTX)
    const haikuScore = scoreProvider(ANTHROPIC_HAIKU, DEEP_CTX)
    expect(opusScore).toBeGreaterThan(haikuScore)
  })

  it("selectBestProvider returns the highest-scoring model", () => {
    const capabilities = [ANTHROPIC_OPUS, ANTHROPIC_HAIKU]
    const best = selectBestProvider(capabilities, ECONOMY_CTX)
    expect(best?.modelId).toBe("claude-haiku-4-5")
  })

  it("selectBestProvider returns null for empty capabilities", () => {
    const best = selectBestProvider([], ECONOMY_CTX)
    expect(best).toBeNull()
  })
})
