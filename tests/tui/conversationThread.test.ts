// tests/tui/conversationThread.test.ts
// ESLint cannot resolve Effect's Result type in test context
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { describe, it, expect } from "vitest"
import { owlReducer, INITIAL_STATE } from "../../src/tui/state"

const TURN = {
  id: "t-1",
  prompt: "analyze the schema",
  response: "The schema has 3 modules.",
  provider: "anthropic" as const,
  latencyMs: 820,
  inputTokens: 100,
  outputTokens: 50,
  estimatedCostUsd: 0.001,
  timestamp: "2026-05-13T18:00:00Z",
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
})
