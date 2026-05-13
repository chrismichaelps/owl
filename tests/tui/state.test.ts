/**
 * @Owl.Tests.TUI.State
 * Tests for the owlReducer pure function and initial state shape.
 * All tests are synchronous — no Effect, no Ink, no I/O.
 */
// ESLint cannot resolve Effect's Result type in test context
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { describe, it, expect } from "vitest"
import {
  owlReducer,
  INITIAL_STATE,
  type OwlAppState,
  type OwlAction,
} from "../../src/tui/state"

/** Build a minimal InferenceResponse-like fixture */
function makeResponse(
  overrides: Partial<{
    provider: "anthropic" | "openai" | "google" | "xai" | "ollama"
    latencyMs: number
    inputTokens: number
    outputTokens: number
    content: string
  }> = {},
) {
  return {
    taskId: "t-1",
    content: overrides.content ?? "Hello from Owl",
    stopReason: "end_turn" as const,
    usage: {
      inputTokens: overrides.inputTokens ?? 120,
      outputTokens: overrides.outputTokens ?? 55,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
    },
    model: "claude-opus-4-5",
    provider: overrides.provider ?? "anthropic",
    latencyMs: overrides.latencyMs ?? 812,
  }
}

/** Shorthand reducer call */
function reduce(state: OwlAppState, action: OwlAction): OwlAppState {
  return owlReducer(state, action)
}

describe("INITIAL_STATE shape", () => {
  it("starts idle", () => {
    expect(INITIAL_STATE.status).toBe("idle")
  })

  it("has no active role", () => {
    expect(INITIAL_STATE.activeRole).toBeNull()
  })

  it("has zero token counts", () => {
    expect(INITIAL_STATE.totalInputTokens).toBe(0)
    expect(INITIAL_STATE.totalOutputTokens).toBe(0)
  })

  it("has empty logs array", () => {
    expect(INITIAL_STATE.logs).toHaveLength(0)
  })

  it("has null response, error, provider, latencyMs", () => {
    expect(INITIAL_STATE.response).toBeNull()
    expect(INITIAL_STATE.error).toBeNull()
    expect(INITIAL_STATE.provider).toBeNull()
    expect(INITIAL_STATE.latencyMs).toBeNull()
  })

  it("starts at turn 0", () => {
    expect(INITIAL_STATE.turnCount).toBe(0)
  })
})

describe("SET_STATUS action", () => {
  it("transitions idle → routing", () => {
    const next = reduce(INITIAL_STATE, {
      type: "SET_STATUS",
      status: "routing",
    })
    expect(next.status).toBe("routing")
  })

  it("transitions routing → inferring", () => {
    const s = { ...INITIAL_STATE, status: "routing" as const }
    const next = reduce(s, { type: "SET_STATUS", status: "inferring" })
    expect(next.status).toBe("inferring")
  })

  it("transitions any → error without touching other fields", () => {
    const s = { ...INITIAL_STATE, turnCount: 3 }
    const next = reduce(s, { type: "SET_STATUS", status: "error" })
    expect(next.status).toBe("error")
    expect(next.turnCount).toBe(3)
  })
})

describe("SET_ROLE action", () => {
  it("sets Architect role", () => {
    const next = reduce(INITIAL_STATE, { type: "SET_ROLE", role: "Architect" })
    expect(next.activeRole).toBe("Architect")
  })

  it("sets DNA Engineer role", () => {
    const next = reduce(INITIAL_STATE, {
      type: "SET_ROLE",
      role: "DNA Engineer",
    })
    expect(next.activeRole).toBe("DNA Engineer")
  })

  it("sets Forensic Guardian role", () => {
    const next = reduce(INITIAL_STATE, {
      type: "SET_ROLE",
      role: "Forensic Guardian",
    })
    expect(next.activeRole).toBe("Forensic Guardian")
  })

  it("can clear role back to null", () => {
    const s = { ...INITIAL_STATE, activeRole: "Architect" as const }
    const next = reduce(s, { type: "SET_ROLE", role: null })
    expect(next.activeRole).toBeNull()
  })
})

describe("ADD_LOG action", () => {
  it("appends a log entry", () => {
    const next = reduce(INITIAL_STATE, {
      type: "ADD_LOG",
      msg: "▶ Task: hello",
    })
    expect(next.logs).toHaveLength(1)
    expect(next.logs[0]).toContain("▶ Task: hello")
  })

  it("prepends a timestamp to the entry", () => {
    const next = reduce(INITIAL_STATE, { type: "ADD_LOG", msg: "test" })
    // e.g. "10:22:05 AM test"
    expect(next.logs[0]).toMatch(/\d+:\d+:\d+/)
  })

  it("accumulates multiple entries in order", () => {
    let s = INITIAL_STATE
    s = reduce(s, { type: "ADD_LOG", msg: "first" })
    s = reduce(s, { type: "ADD_LOG", msg: "second" })
    s = reduce(s, { type: "ADD_LOG", msg: "third" })
    expect(s.logs).toHaveLength(3)
    expect(s.logs[2]).toContain("third")
  })

  it("caps the log buffer at 100 entries", () => {
    let s = INITIAL_STATE
    for (let i = 0; i < 110; i++) {
      s = reduce(s, { type: "ADD_LOG", msg: `entry-${String(i)}` })
    }
    expect(s.logs.length).toBeLessThanOrEqual(100)
    // newest entry survives
    expect(s.logs[s.logs.length - 1]).toContain("entry-109")
  })

  it("does not mutate other state fields", () => {
    const s = { ...INITIAL_STATE, turnCount: 7 }
    const next = reduce(s, { type: "ADD_LOG", msg: "x" })
    expect(next.turnCount).toBe(7)
    expect(next.status).toBe("idle")
  })
})

describe("SET_RESPONSE action", () => {
  it("sets status to complete", () => {
    const next = reduce(INITIAL_STATE, {
      type: "SET_RESPONSE",
      response: makeResponse(),
    })
    expect(next.status).toBe("complete")
  })

  it("switches active role to Forensic Guardian", () => {
    const next = reduce(INITIAL_STATE, {
      type: "SET_RESPONSE",
      response: makeResponse(),
    })
    expect(next.activeRole).toBe("Forensic Guardian")
  })

  it("stores the response object", () => {
    const resp = makeResponse({ content: "Result!" })
    const next = reduce(INITIAL_STATE, { type: "SET_RESPONSE", response: resp })
    expect(next.response).toBe(resp)
  })

  it("accumulates input tokens across turns", () => {
    let s = INITIAL_STATE
    s = reduce(s, {
      type: "SET_RESPONSE",
      response: makeResponse({ inputTokens: 100 }),
    })
    s = reduce(s, {
      type: "SET_RESPONSE",
      response: makeResponse({ inputTokens: 200 }),
    })
    expect(s.totalInputTokens).toBe(300)
  })

  it("accumulates output tokens across turns", () => {
    let s = INITIAL_STATE
    s = reduce(s, {
      type: "SET_RESPONSE",
      response: makeResponse({ outputTokens: 50 }),
    })
    s = reduce(s, {
      type: "SET_RESPONSE",
      response: makeResponse({ outputTokens: 75 }),
    })
    expect(s.totalOutputTokens).toBe(125)
  })

  it("records provider name", () => {
    const next = reduce(INITIAL_STATE, {
      type: "SET_RESPONSE",
      response: makeResponse({ provider: "google" }),
    })
    expect(next.provider).toBe("google")
  })

  it("records latency", () => {
    const next = reduce(INITIAL_STATE, {
      type: "SET_RESPONSE",
      response: makeResponse({ latencyMs: 1200 }),
    })
    expect(next.latencyMs).toBe(1200)
  })

  it("increments turnCount on each response", () => {
    let s = INITIAL_STATE
    s = reduce(s, { type: "SET_RESPONSE", response: makeResponse() })
    s = reduce(s, { type: "SET_RESPONSE", response: makeResponse() })
    expect(s.turnCount).toBe(2)
  })
})

describe("SET_ERROR action", () => {
  it("sets status to error", () => {
    const next = reduce(INITIAL_STATE, {
      type: "SET_ERROR",
      error: "Provider timeout",
    })
    expect(next.status).toBe("error")
  })

  it("stores the error message", () => {
    const next = reduce(INITIAL_STATE, {
      type: "SET_ERROR",
      error: "Provider timeout",
    })
    expect(next.error).toBe("Provider timeout")
  })

  it("does not change token counts", () => {
    const s = {
      ...INITIAL_STATE,
      totalInputTokens: 42,
      totalOutputTokens: 17,
    }
    const next = reduce(s, { type: "SET_ERROR", error: "boom" })
    expect(next.totalInputTokens).toBe(42)
    expect(next.totalOutputTokens).toBe(17)
  })
})

describe("RESET action", () => {
  it("returns to idle status", () => {
    const s = { ...INITIAL_STATE, status: "inferring" as const }
    const next = reduce(s, { type: "RESET" })
    expect(next.status).toBe("idle")
  })

  it("clears response", () => {
    const s = { ...INITIAL_STATE, response: makeResponse() }
    const next = reduce(s, { type: "RESET" })
    expect(next.response).toBeNull()
  })

  it("clears error", () => {
    const s = { ...INITIAL_STATE, error: "oops" }
    const next = reduce(s, { type: "RESET" })
    expect(next.error).toBeNull()
  })

  it("clears logs", () => {
    let s = INITIAL_STATE
    s = reduce(s, { type: "ADD_LOG", msg: "a" })
    s = reduce(s, { type: "ADD_LOG", msg: "b" })
    const next = reduce(s, { type: "RESET" })
    expect(next.logs).toHaveLength(0)
  })

  it("preserves accumulated token counts across reset", () => {
    let s = INITIAL_STATE
    s = reduce(s, {
      type: "SET_RESPONSE",
      response: makeResponse({ inputTokens: 300, outputTokens: 100 }),
    })
    const next = reduce(s, { type: "RESET" })
    expect(next.totalInputTokens).toBe(300)
    expect(next.totalOutputTokens).toBe(100)
  })

  it("preserves turnCount across reset", () => {
    let s = INITIAL_STATE
    s = reduce(s, { type: "SET_RESPONSE", response: makeResponse() })
    s = reduce(s, { type: "SET_RESPONSE", response: makeResponse() })
    const next = reduce(s, { type: "RESET" })
    expect(next.turnCount).toBe(2)
  })
})

describe("reducer immutability", () => {
  it("never mutates the input state object", () => {
    const frozen = Object.freeze({ ...INITIAL_STATE })
    expect(() =>
      reduce(frozen, { type: "SET_STATUS", status: "routing" }),
    ).not.toThrow()
  })

  it("returns a new reference on every update", () => {
    const next = reduce(INITIAL_STATE, {
      type: "SET_STATUS",
      status: "routing",
    })
    expect(next).not.toBe(INITIAL_STATE)
  })
})
