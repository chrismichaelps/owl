/**
 * @Owl.TUI.State - Centralized app state types and reducer for Ink TUI
 *
 * State management for the terminal UI using React's useReducer.
 * All state is immutable — mutations return new state objects.
 *
 * State sections:
 * - Status: Agent workflow state (idle, routing, inferring, complete, error)
 * - Role: Active FMCF role (Architect, DNA Engineer, Shadow, Forensic Guardian)
 * - Logs: Rolling log of engine events (max 100 entries)
 * - Response: Latest inference result (null until complete)
 * - Metrics: Token counts, provider, latency, turn count
 * - Turns: Full conversation history
 * - Streaming: In-progress response text
 */
import type { TokenUsage, ProviderId } from "../core/schema/index.js"

/** @Owl.TUI.State.Status - Agent workflow states */
export type AgentStatus =
  | "idle"
  | "routing"
  | "inferring"
  | "complete"
  | "error"

/** @Owl.TUI.State.Role - Active FMCF specialist role */
export type ActiveRole =
  | "Architect"
  | "DNA Engineer"
  | "Shadow"
  | "Forensic Guardian"
  | null

/**
 * @Owl.TUI.State.Turn - One completed conversation turn
 *
 * Immutable record of a complete user→assistant exchange.
 */
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

/**
 * @Owl.TUI.State.Response - Plain response snapshot (safe subset of InferenceResponse)
 */
export interface ResponseSnapshot {
  readonly taskId: string
  readonly content: string
  readonly model: string
  readonly provider: ProviderId
  readonly latencyMs: number
  readonly usage: TokenUsage
}

/** @Owl.TUI.State.App - Full application state shape */
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

/** @Owl.TUI.State.Action - Discriminated union of all state transitions */
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

/** @Owl.TUI.State.Initial - Default state for new sessions */
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
 *
 * Deterministic: same (state, action) → same next state
 * No side-effects, no async — all mutations return new state objects
 */
export function owlReducer(state: OwlAppState, action: OwlAction): OwlAppState {
  switch (action.type) {
    /** @Owl.TUI.State.Reducer.SET_STATUS — Transitions agent status */
    case "SET_STATUS":
      return { ...state, status: action.status }

    /** @Owl.TUI.State.Reducer.SET_ROLE — Sets active FMCF role */
    case "SET_ROLE":
      return { ...state, activeRole: action.role }

    /** @Owl.TUI.State.Reducer.ADD_LOG — Appends timestamped message to log buffer */
    case "ADD_LOG":
      return {
        ...state,
        logs: [
          ...state.logs.slice(-99),
          `${new Date().toLocaleTimeString()} ${action.msg}`,
        ],
      }

    /** @Owl.TUI.State.Reducer.SET_RESPONSE — Completes inference, accumulates tokens */
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

    /** @Owl.TUI.State.Reducer.SET_ERROR — Sets error state */
    case "SET_ERROR":
      return { ...state, status: "error", error: action.error }

    /** @Owl.TUI.State.Reducer.ADD_TURN — Appends completed turn to history */
    case "ADD_TURN":
      return { ...state, turns: [...state.turns, action.turn] }

    /** @Owl.TUI.State.Reducer.APPEND_STREAM — Accumulates streaming text */
    case "APPEND_STREAM":
      return {
        ...state,
        streamingContent: state.streamingContent + action.text,
      }

    /** @Owl.TUI.State.Reducer.CLEAR_STREAM — Clears streaming buffer */
    case "CLEAR_STREAM":
      return { ...state, streamingContent: "" }

    /** @Owl.TUI.State.Reducer.RESET — Returns to idle, preserves metrics */
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
