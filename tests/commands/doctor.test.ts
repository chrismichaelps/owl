/** @Owl.Tests.Commands.Doctor - RuntimeDiagnostic command coverage */
import { Chunk, Effect, Option } from "effect"
import { describe, expect, it } from "vitest"
import {
  formatDoctorSection,
  makeDoctorCommand,
  type DoctorCommandDependencies,
} from "../../src/commands/management/doctor.js"
import type { UsageMetricsSnapshot } from "../../src/engine/metrics/index.js"
import type { ProviderCapability } from "../../src/providers/types.js"

const capability: ProviderCapability = {
  providerId: "anthropic",
  modelId: "claude-opus-4-5",
  contextWindow: 200_000,
  maxOutputTokens: 8_192,
  inputCostPer1k: 0.015,
  outputCostPer1k: 0.075,
  supportsStreaming: true,
  reasoningDepth: "high",
  supportsFunctionCalling: true,
  supportsVision: true,
}

const emptyMetrics: UsageMetricsSnapshot = {
  totalCalls: 2,
  inputTokens: 100,
  outputTokens: 50,
  totalCacheReadTokens: 25,
  totalCacheWriteTokens: 10,
  totalEstimatedCostUsd: 0.01,
  cacheHitRate: 0.5,
  totalTokens: 150,
  averageLatencyMs: 123,
  byProvider: [],
  byModel: [],
  recent: [],
}

const makeDeps = (): DoctorCommandDependencies => ({
  providerRouter: {
    route: () => Effect.die("not used"),
    complete: () => Effect.die("not used"),
    completeParallel: () => Effect.die("not used"),
    completeWithCallback: () => Effect.die("not used"),
    listProviders: () => Effect.succeed(Chunk.make("anthropic")),
    listCapabilities: () => Effect.succeed(Chunk.make(capability)),
    listReliability: () =>
      Effect.succeed(
        Chunk.make({
          provider: "anthropic",
          successes: 3,
          failures: 1,
          score: 0.75,
        }),
      ),
    checkHealth: () =>
      Effect.succeed(
        Chunk.make({
          provider: "anthropic",
          healthy: true,
          message: null,
        }),
      ),
  },
  mcpManager: {
    getTools: () => Effect.succeed(Chunk.empty()),
    callTool: () => Effect.succeed(""),
    getServers: () =>
      Effect.succeed([
        {
          name: "filesystem",
          connected: false,
          toolCount: 0,
          error: "not configured",
        },
      ]),
  },
  builtInTools: {
    listAllTools: () =>
      Chunk.make(
        {
          name: "Read",
          description: "Read files",
          modelVisible: true,
        },
        {
          name: "Write",
          description: "Write files",
          modelVisible: false,
        },
      ),
    getTools: () => Chunk.empty(),
    callTool: () => Effect.die("not used"),
    hasTool: () => false,
  },
  sessionMemory: {
    startSession: () => Effect.succeed("session-1"),
    resumeSession: () => Effect.succeed("session-1"),
    getSessionId: () => Effect.succeed("session-1"),
    recordTurn: () => Effect.void,
    getTurns: () =>
      Effect.succeed(
        Chunk.make({
          taskId: "task-1",
          prompt: "hello",
          response: "world",
          tokensUsed: 12,
          timestamp: "2026-05-18T00:00:00Z",
        }),
      ),
    summarize: () => Effect.succeed("Session session-1: 1 turns"),
  },
  usageMetrics: {
    recordInference: () => Effect.void,
    snapshot: () => Effect.succeed(emptyMetrics),
    reset: () => Effect.void,
  },
  contextCache: {
    store: () => Effect.void,
    get: () => Effect.succeed(Option.none()),
    invalidate: () => Effect.void,
    invalidateAll: () => Effect.void,
    totalSavedTokens: () => Effect.succeed(42),
  },
})

describe("makeDoctorCommand", () => {
  it("formats empty diagnostic sections deterministically", () => {
    expect(formatDoctorSection("Warnings", Chunk.empty())).toBe(
      "Warnings\n- none",
    )
  })

  it("renders runtime diagnostics without invoking inference", async () => {
    const command = makeDoctorCommand(makeDeps())
    const result = await Effect.runPromise(command.execute([]))

    expect(result.output).toContain("Providers")
    expect(result.output).toContain(
      "- anthropic/claude-opus-4-5 · high · ctx 200000",
    )
    expect(result.output).toContain("- anthropic: healthy")
    expect(result.output).toContain("- anthropic: score 0.75 · 3 ok / 1 fail")
    expect(result.output).toContain("MCP servers")
    expect(result.output).toContain(
      "- filesystem: disconnected · 0 tools — not configured",
    )
    expect(result.output).toContain("- model-visible: 1")
    expect(result.output).toContain("- internal-only: 1")
    expect(result.output).toContain("- turns: 1")
    expect(result.output).toContain("- inference calls: 2")
    expect(result.output).toContain("- saved tokens: 42")
    expect(result.output).toContain("- MCP disconnected: filesystem")
  })
})
