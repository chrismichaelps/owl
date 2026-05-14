/** @Owl.TUI.State - Centralized app state types and reducer for Ink TUI */
import type { TokenUsage, ProviderId } from "../core/schema/index.js"

export type AgentStatus =
  | "idle"
  | "routing"
  | "inferring"
  | "complete"
  | "error"

export type ActiveRole =
  | "Architect"
  | "DNA Engineer"
  | "Shadow"
  | "Forensic Guardian"
  | null

/** @Owl.TUI.State.Turn - One completed conversation turn */
export interface ConversationTurn {
  readonly id: string
  readonly prompt: string
  readonly response: string
  readonly provider: ProviderId
  readonly latencyMs: number
  readonly inputTokens: number
  readonly outputTokens: number
  readonly timestamp: string
}

/** @Owl.TUI.State.Response - Plain response snapshot (safe subset of InferenceResponse) */
export interface ResponseSnapshot {
  readonly taskId: string
  readonly content: string
  readonly model: string
  readonly provider: ProviderId
  readonly latencyMs: number
  readonly usage: TokenUsage
}

export interface OwlAppState {
  readonly status: AgentStatus
  readonly activeRole: ActiveRole
  readonly logs: readonly string[]
  readonly response: ResponseSnapshot | null
  readonly error: string | null
  readonly totalInputTokens: number
  readonly totalOutputTokens: number
  readonly provider: ProviderId | null
  readonly latencyMs: number | null
  readonly turnCount: number
  readonly turns: readonly ConversationTurn[]
  readonly streamingContent: string
}

export type OwlAction =
  | { readonly type: "SET_STATUS"; readonly status: AgentStatus }
  | { readonly type: "SET_ROLE"; readonly role: ActiveRole }
  | { readonly type: "ADD_LOG"; readonly msg: string }
  | { readonly type: "SET_RESPONSE"; readonly response: ResponseSnapshot }
  | { readonly type: "SET_ERROR"; readonly error: string }
  | { readonly type: "ADD_TURN"; readonly turn: ConversationTurn }
  | { readonly type: "APPEND_STREAM"; readonly text: string }
  | { readonly type: "CLEAR_STREAM" }
  | { readonly type: "RESET" }

export const INITIAL_STATE: OwlAppState = {
  status: "idle",
  activeRole: null,
  logs: [],
  response: null,
  error: null,
  totalInputTokens: 0,
  totalOutputTokens: 0,
  provider: null,
  latencyMs: null,
  turnCount: 0,
  turns: [],
  streamingContent: "",
}

/**
 * @Owl.TUI.State.Reducer - Pure state transition function for OwlAppState
 * Deterministic: same (state, action) → same next state
 * No side-effects, no async — all mutations return new state objects
 */
export function owlReducer(state: OwlAppState, action: OwlAction): OwlAppState {
  switch (action.type) {
    /** @Owl.TUI.State.Reducer.SET_STATUS — Transitions agent status */
    case "SET_STATUS":
      return { ...state, status: action.status }

    /** @Owl.TUI.State.Reducer.SET_ROLE — Sets active FMCF role (Architect/DNA Engineer/Shadow/Forensic Guardian) */
    case "SET_ROLE":
      return { ...state, activeRole: action.role }

    /** @Owl.TUI.State.Reducer.ADD_LOG — Appends timestamped message to log buffer (capped at 100 entries) */
    case "ADD_LOG":
      return {
        ...state,
        logs: [
          ...state.logs.slice(-99),
          `${new Date().toLocaleTimeString()} ${action.msg}`,
        ],
      }

    /** @Owl.TUI.State.Reducer.SET_RESPONSE — Completes inference, accumulates tokens, sets Forensic Guardian role */
    case "SET_RESPONSE":
      return {
        ...state,
        status: "complete",
        activeRole: "Forensic Guardian",
        response: action.response,
        totalInputTokens:
          state.totalInputTokens + action.response.usage.inputTokens,
        totalOutputTokens:
          state.totalOutputTokens + action.response.usage.outputTokens,
        provider: action.response.provider,
        latencyMs: action.response.latencyMs,
        turnCount: state.turnCount + 1,
      }

    /** @Owl.TUI.State.Reducer.SET_ERROR — Sets error state, preserves accumulated tokens */
    case "SET_ERROR":
      return { ...state, status: "error", error: action.error }

    /** @Owl.TUI.State.Reducer.ADD_TURN — Appends completed turn to conversation history */
    case "ADD_TURN":
      return { ...state, turns: [...state.turns, action.turn] }

    /** @Owl.TUI.State.Reducer.APPEND_STREAM — Accumulates streaming response text */
    case "APPEND_STREAM":
      return {
        ...state,
        streamingContent: state.streamingContent + action.text,
      }

    /** @Owl.TUI.State.Reducer.CLEAR_STREAM — Clears streaming content buffer */
    case "CLEAR_STREAM":
      return { ...state, streamingContent: "" }

    /** @Owl.TUI.State.Reducer.RESET — Returns to idle, preserves session metrics (tokens, turns, count) */
    case "RESET":
      return {
        ...INITIAL_STATE,
        totalInputTokens: state.totalInputTokens,
        totalOutputTokens: state.totalOutputTokens,
        turnCount: state.turnCount,
        turns: state.turns,
      }
  }
}
