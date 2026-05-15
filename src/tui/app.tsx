/**
 * @Owl.TUI.App - Root Ink app: 3-panel layout + REPL prompt, wired to Orchestrator
 *
 * Main React component for the Ink-based terminal UI.
 * Composes:
 * - LogPanel (left): Engine logs, active role badge
 * - OutputPanel (center): Conversation thread, spinner
 * - MetaPanel (right): Provider, token, latency metrics
 * - PromptInput (bottom): REPL with history navigation
 * - StatusBar (bottom-most): Mode, cost, keybinding hints
 *
 * Lifecycle:
 * 1. Mount: Initialize runtime, reset state
 * 2. Initial prompt: If provided via CLI args, auto-submit
 * 3. User input: Handle prompts and slash commands
 * 4. Inference: Orchestrate via Effect, update state
 * 5. Cleanup: Dispose runtime on unmount
 *
 * @example
 * <App runtime={runtime} initialMode="deep" initialPrompt="Analyze this code" />
 */
import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react"
import { Box, useApp } from "ink"
import { Effect } from "effect"
import { LogPanel } from "./components/LogPanel.js"
import { OutputPanel } from "./components/OutputPanel.js"
import { MetaPanel } from "./components/MetaPanel.js"
import { StatusBar } from "./components/StatusBar.js"
import { PromptInput } from "./components/PromptInput.js"
import { owlReducer, INITIAL_STATE } from "./state.js"
import type { Mode } from "../core/schema/index.js"
import type { OwlRuntime } from "../cli/runtime.js"
import { Orchestrator } from "../engine/orchestrator/index.js"
import { CommandRegistry } from "../commands/registry.js"
import { parseCommand } from "../commands/parser.js"
import { TUI_CONSTANTS } from "../core/constants/index.js"

/** @Owl.TUI.App.Props - Component props */
interface AppProps {
  readonly runtime: OwlRuntime
  readonly initialMode?: Mode
  readonly initialPrompt?: string | null
}

/** @Owl.TUI.App.Root - Main app component */
export const App: React.FC<AppProps> = ({
  runtime,
  initialMode = "standard",
  initialPrompt,
}) => {
  useApp() // access to exit()
  const [state, dispatch] = useReducer(owlReducer, INITIAL_STATE)
  const taskCounterRef = useRef(0)
  const commandCounterRef = useRef(0)
  const didSubmitInitialPromptRef = useRef(false)
  const [mode, setMode] = useState<Mode>(initialMode)

  const isProcessing =
    state.status === "routing" || state.status === "inferring"

  /** Submit a prompt for inference */
  const handleSubmit = useCallback(
    (prompt: string, submittedMode: Mode) => {
      taskCounterRef.current += 1
      const taskId =
        TUI_CONSTANTS.TASK_ID_PREFIX + "-" + String(taskCounterRef.current)

      dispatch({ type: "RESET" })
      dispatch({
        type: "ADD_LOG",
        msg:
          "▶ Task: " +
          prompt.slice(0, TUI_CONSTANTS.TASK_LOG_PREVIEW_CHARS),
      })
      dispatch({ type: "SET_ROLE", role: "Architect" })
      dispatch({ type: "SET_STATUS", status: "routing" })

      const effect = Effect.gen(function* () {
        const orch = yield* Orchestrator

        dispatch({ type: "ADD_LOG", msg: "◆ Routing to provider…" })
        dispatch({ type: "SET_ROLE", role: "DNA Engineer" })
        dispatch({ type: "SET_STATUS", status: "inferring" })
        dispatch({ type: "ADD_LOG", msg: "◈ Streaming…" })
        dispatch({ type: "CLEAR_STREAM" })

        const response = yield* orch.runStream(
          {
            id: taskId,
            prompt,
            mode: submittedMode,
            createdAt: new Date().toISOString(),
          },
          (chunk) => {
            dispatch({ type: "APPEND_STREAM", text: chunk })
          },
        )

        dispatch({ type: "SET_ROLE", role: "Forensic Guardian" })
        dispatch({ type: "ADD_LOG", msg: "✓ Registry sync complete" })
        dispatch({ type: "SET_RESPONSE", response })
        dispatch({
          type: "ADD_TURN",
          turn: {
            id: taskId,
            kind: "inference",
            prompt,
            response: response.content,
            provider: response.provider,
            latencyMs: response.latencyMs,
            inputTokens: response.usage.inputTokens,
            outputTokens: response.usage.outputTokens,
            estimatedCostUsd: response.usage.estimatedCostUsd,
            timestamp: new Date().toISOString(),
          },
        })
      })

      void runtime.runPromise(effect).catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : "Unknown inference error"
        dispatch({ type: "SET_ERROR", error: msg })
        dispatch({ type: "ADD_LOG", msg: `✗ Error: ${msg.slice(0, 60)}` })
      })
    },
    [runtime],
  )

  /** Update mode (affects PromptInput border color and token budget) */
  const handleModeChange = useCallback((newMode: Mode) => {
    setMode(newMode)
    dispatch({ type: "ADD_LOG", msg: `Mode → ${newMode}` })
  }, [])

  /** Dispatch a slash command */
  const handleCommand = useCallback(
    (raw: string) => {
      const effect = Effect.gen(function* () {
        const registry = yield* CommandRegistry
        const parsed = yield* parseCommand(raw)
        const result = yield* registry.dispatch(parsed)
        commandCounterRef.current += 1
        dispatch({
          type: "ADD_LOG",
          msg:
            "[cmd] " +
            result.output.slice(0, TUI_CONSTANTS.LOG_PREVIEW_CHARS),
        })
        dispatch({
          type: "ADD_TURN",
          turn: {
            id:
              TUI_CONSTANTS.COMMAND_TURN_ID_PREFIX +
              "-" +
              String(commandCounterRef.current),
            kind: "command",
            command: raw,
            output: result.output,
            timestamp: new Date().toISOString(),
          },
        })
      })
      void runtime.runPromise(effect).catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        commandCounterRef.current += 1
        dispatch({
          type: "ADD_LOG",
          msg:
            "✗ Cmd error: " +
            msg.slice(0, TUI_CONSTANTS.ERROR_LOG_PREVIEW_CHARS),
        })
        dispatch({
          type: "ADD_TURN",
          turn: {
            id:
              TUI_CONSTANTS.COMMAND_TURN_ID_PREFIX +
              "-" +
              String(commandCounterRef.current),
            kind: "command",
            command: raw,
            output: "Error: " + msg,
            timestamp: new Date().toISOString(),
          },
        })
      })
    },
    [runtime],
  )

  /** Auto-submit initial prompt on mount */
  useEffect(() => {
    if (didSubmitInitialPromptRef.current) return
    didSubmitInitialPromptRef.current = true

    if (initialPrompt != null && initialPrompt.trim().length > 0) {
      handleSubmit(initialPrompt.trim(), initialMode)
    }
  }, [handleSubmit, initialMode, initialPrompt])

  return (
    <Box flexDirection="column" height="100%">
      {/* Three-panel main area */}
      <Box flexGrow={1} gap={0}>
        <LogPanel
          logs={state.logs}
          status={state.status}
          activeRole={state.activeRole}
        />
        <OutputPanel
          status={state.status}
          turns={state.turns}
          error={state.error}
          streamingContent={state.streamingContent}
        />
        <MetaPanel state={state} />
      </Box>

      {/* Input row */}
      <PromptInput
        mode={mode}
        disabled={isProcessing}
        onSubmit={handleSubmit}
        onCommand={handleCommand}
        onModeChange={handleModeChange}
      />

      {/* Status bar */}
      <StatusBar
        status={state.status}
        totalInputTokens={state.totalInputTokens}
        totalOutputTokens={state.totalOutputTokens}
        totalEstimatedCostUsd={state.totalEstimatedCostUsd}
        mode={mode}
      />
    </Box>
  )
}
