/** @Owl.TUI.App - Root Ink app: 3-panel layout + REPL prompt, wired to Orchestrator */
import React, { useCallback, useReducer, useState } from "react"
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

interface AppProps {
  readonly runtime: OwlRuntime
  readonly initialMode?: Mode
}

let taskCounter = 0

export const App: React.FC<AppProps> = ({
  runtime,
  initialMode = "standard",
}) => {
  useApp() // access to exit()
  const [state, dispatch] = useReducer(owlReducer, INITIAL_STATE)
  const [mode, setMode] = useState<Mode>(initialMode)

  const isProcessing =
    state.status === "routing" || state.status === "inferring"

  const handleSubmit = useCallback(
    (prompt: string, submittedMode: Mode) => {
      taskCounter += 1
      const taskId = `task-${String(taskCounter)}`

      dispatch({ type: "RESET" })
      dispatch({ type: "ADD_LOG", msg: `▶ Task: ${prompt.slice(0, 40)}` })
      dispatch({ type: "SET_ROLE", role: "Architect" })
      dispatch({ type: "SET_STATUS", status: "routing" })

      const effect = Effect.gen(function* () {
        const orch = yield* Orchestrator

        dispatch({ type: "ADD_LOG", msg: "◆ Routing to provider…" })
        dispatch({ type: "SET_ROLE", role: "DNA Engineer" })
        dispatch({ type: "SET_STATUS", status: "inferring" })
        dispatch({ type: "ADD_LOG", msg: "◈ Inferring…" })

        const response = yield* orch.run({
          id: taskId,
          prompt,
          mode: submittedMode,
          createdAt: new Date().toISOString(),
        })

        dispatch({ type: "SET_ROLE", role: "Forensic Guardian" })
        dispatch({ type: "ADD_LOG", msg: "✓ Registry sync complete" })
        dispatch({ type: "SET_RESPONSE", response })
        dispatch({
          type: "ADD_TURN",
          turn: {
            id: taskId,
            prompt,
            response: response.content,
            provider: response.provider,
            latencyMs: response.latencyMs,
            inputTokens: response.usage.inputTokens,
            outputTokens: response.usage.outputTokens,
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

  const handleModeChange = useCallback((newMode: Mode) => {
    setMode(newMode)
    dispatch({ type: "ADD_LOG", msg: `Mode → ${newMode}` })
  }, [])

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
        />
        <MetaPanel state={state} />
      </Box>

      {/* Input row */}
      <PromptInput
        mode={mode}
        disabled={isProcessing}
        onSubmit={handleSubmit}
        onModeChange={handleModeChange}
      />

      {/* Status bar */}
      <StatusBar
        status={state.status}
        totalInputTokens={state.totalInputTokens}
        totalOutputTokens={state.totalOutputTokens}
        mode={mode}
      />
    </Box>
  )
}
