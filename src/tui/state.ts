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
}

export type OwlAction =
  | { readonly type: "SET_STATUS"; readonly status: AgentStatus }
  | { readonly type: "SET_ROLE"; readonly role: ActiveRole }
  | { readonly type: "ADD_LOG"; readonly msg: string }
  | { readonly type: "SET_RESPONSE"; readonly response: ResponseSnapshot }
  | { readonly type: "SET_ERROR"; readonly error: string }
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
}

export function owlReducer(state: OwlAppState, action: OwlAction): OwlAppState {
  switch (action.type) {
    case "SET_STATUS":
      return { ...state, status: action.status }
    case "SET_ROLE":
      return { ...state, activeRole: action.role }
    case "ADD_LOG":
      return {
        ...state,
        logs: [
          ...state.logs.slice(-99),
          `${new Date().toLocaleTimeString()} ${action.msg}`,
        ],
      }
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
    case "SET_ERROR":
      return { ...state, status: "error", error: action.error }
    case "RESET":
      return {
        ...INITIAL_STATE,
        totalInputTokens: state.totalInputTokens,
        totalOutputTokens: state.totalOutputTokens,
        turnCount: state.turnCount,
      }
  }
}
