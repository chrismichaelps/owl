// tests/tui/conversationThread.test.ts
// ESLint cannot resolve Effect's Result type in test context
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { describe, it, expect } from "vitest"
import { Chunk } from "effect"
import { owlReducer, INITIAL_STATE } from "../../src/tui/state"

const TURN = {
  kind: "inference" as const,
  id: "t-1",
  prompt: "analyze the schema",
  response: "The schema has 3 modules.",
  provider: "anthropic" as const,
  model: "claude-opus-4-5",
  requestedMode: "standard" as const,
  routingMode: "standard" as const,
  latencyMs: 820,
  inputTokens: 100,
  outputTokens: 50,
  estimatedCostUsd: 0.001,
  timestamp: "2026-05-13T18:00:00Z",
}

const COMMAND_TURN = {
  kind: "command" as const,
  id: "cmd-1",
  command: "/help",
  output: "/help - List available slash commands",
  timestamp: "2026-05-13T18:00:01Z",
}

describe("ADD_TURN action", () => {
  it("appends a turn to an empty thread", () => {
    const next = owlReducer(INITIAL_STATE, { type: "ADD_TURN", turn: TURN })
    expect(next.turns).toHaveLength(1)
    expect(next.turns[0]).toBe(TURN)
  })

  it("appends multiple turns in order", () => {
    let s = INITIAL_STATE
    s = owlReducer(s, { type: "ADD_TURN", turn: { ...TURN, id: "t-1" } })
    s = owlReducer(s, { type: "ADD_TURN", turn: { ...TURN, id: "t-2" } })
    expect(s.turns[0]?.id).toBe("t-1")
    expect(s.turns[1]?.id).toBe("t-2")
  })

  it("does not mutate other state fields on ADD_TURN", () => {
    const next = owlReducer(INITIAL_STATE, { type: "ADD_TURN", turn: TURN })
    expect(next.status).toBe("idle")
    expect(next.totalInputTokens).toBe(0)
  })

  it("RESET preserves turns (they are session history)", () => {
    let s = owlReducer(INITIAL_STATE, { type: "ADD_TURN", turn: TURN })
    s = owlReducer(s, { type: "RESET" })
    expect(s.turns).toHaveLength(1)
  })

  it("appends command results to the conversation thread", () => {
    const next = owlReducer(INITIAL_STATE, {
      type: "ADD_TURN",
      turn: COMMAND_TURN,
    })
    expect(next.turns).toEqual([COMMAND_TURN])
  })

  it("tracks pending edit approvals separately from conversation turns", () => {
    const pendingMutations = Chunk.make({
      mutationId: "edit-abc",
      files: Chunk.make("src/example.ts"),
      previewCount: 1,
      createdAt: "2026-05-17T10:00:00Z",
    })
    const next = owlReducer(INITIAL_STATE, {
      type: "SET_PENDING_MUTATIONS",
      pendingMutations,
    })
    expect(Chunk.size(next.pendingMutations)).toBe(1)
    expect(next.turns).toHaveLength(0)
  })

  it("RESET preserves pending edit approvals", () => {
    const pendingMutations = Chunk.make({
      mutationId: "edit-abc",
      files: Chunk.make("src/example.ts"),
      previewCount: 1,
      createdAt: "2026-05-17T10:00:00Z",
    })
    let state = owlReducer(INITIAL_STATE, {
      type: "SET_PENDING_MUTATIONS",
      pendingMutations,
    })
    state = owlReducer(state, { type: "RESET" })
    expect(Chunk.size(state.pendingMutations)).toBe(1)
  })
})
