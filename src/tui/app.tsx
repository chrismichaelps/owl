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
import { Box, useApp, useInput } from "ink"
import { Chunk, Effect } from "effect"
import { LogPanel } from "./components/LogPanel.js"
import { OutputPanel } from "./components/OutputPanel.js"
import { MetaPanel } from "./components/MetaPanel.js"
import { StatusBar } from "./components/StatusBar.js"
import { PromptInput } from "./components/PromptInput.js"
import { WelcomePanel } from "./components/WelcomePanel.js"
import { CommandPalette } from "./components/CommandPalette.js"
import { ShortcutsOverlay } from "./components/ShortcutsOverlay.js"
import { useOwlRuntimeActions } from "./hooks/useOwlRuntimeActions.js"
import { owlReducer, INITIAL_STATE } from "./state.js"
import type { Mode } from "../core/schema/index.js"
import type { OwlRuntime } from "../cli/runtime.js"
import { CommandRegistry } from "../commands/registry.js"
import { AGENT_STATUS } from "../core/constants/index.js"
import type { PaletteCommand } from "./commands/fuzzy.js"

/** @Owl.TUI.App.Props - Component props */
interface AppProps {
  readonly runtime: OwlRuntime
  readonly projectRoot?: string
  readonly initialMode?: Mode
  readonly initialPrompt?: string | null
}

/** @Owl.TUI.App.Root - Main app component */
export const App: React.FC<AppProps> = ({
  runtime,
  projectRoot = process.cwd(),
  initialMode = "standard",
  initialPrompt,
}) => {
  useApp() // access to exit()
  const [state, dispatch] = useReducer(owlReducer, INITIAL_STATE)
  const didSubmitInitialPromptRef = useRef(false)
  const [mode, setMode] = useState<Mode>(initialMode)
  const [paletteState, setPaletteState] = useState({
    open: false,
    query: "",
    selectedIndex: 0,
  })
  const [commands, setCommands] = useState<readonly PaletteCommand[]>([])
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  const isProcessing =
    state.status === AGENT_STATUS.ROUTING ||
    state.status === AGENT_STATUS.INFERRING
  const showWelcome =
    state.turns.length === 0 && !isProcessing && state.error === null

  const { handleSubmit, handleCommand, handleCancel, syncRoutingPreferences } =
    useOwlRuntimeActions(runtime, dispatch, projectRoot)

  // Global Escape key: cancel inference when processing
  useInput(
    (_input, key) => {
      if (key.escape) handleCancel()
    },
    { isActive: isProcessing },
  )

  // Overlay Escape key: close shortcuts before input resumes
  useInput(
    (_input, key) => {
      if (key.escape) setShortcutsOpen(false)
    },
    { isActive: shortcutsOpen },
  )

  /** Update mode (affects PromptInput border color and token budget) */
  const handleModeChange = useCallback((newMode: Mode) => {
    setMode(newMode)
    dispatch({ type: "ADD_LOG", msg: `Mode → ${newMode}` })
  }, [])

  /** Auto-submit initial prompt on mount */
  useEffect(() => {
    if (didSubmitInitialPromptRef.current) return
    didSubmitInitialPromptRef.current = true

    if (initialPrompt != null && initialPrompt.trim().length > 0) {
      handleSubmit(initialPrompt.trim(), initialMode)
    }
  }, [handleSubmit, initialMode, initialPrompt])

  useEffect(() => {
    const effect = Effect.gen(function* () {
      const registry = yield* CommandRegistry
      return yield* registry.list()
    })
    void runtime
      .runPromise(effect)
      .then((listedCommands) => {
        setCommands(Chunk.toReadonlyArray(listedCommands))
      })
      .catch(() => {
        setCommands([])
      })
  }, [runtime])

  useEffect(() => {
    void syncRoutingPreferences().catch(() => undefined)
  }, [syncRoutingPreferences])

  return (
    <Box flexDirection="column" height="100%">
      {showWelcome ? (
        <Box flexGrow={1} justifyContent="center">
          <WelcomePanel
            mode={mode}
            status={state.status}
            activeRole={state.activeRole}
            projectRoot={projectRoot}
            totalInputTokens={state.totalInputTokens}
            totalOutputTokens={state.totalOutputTokens}
            totalEstimatedCostUsd={state.totalEstimatedCostUsd}
          />
        </Box>
      ) : (
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
      )}

      {/* Input row */}
      <CommandPalette
        open={paletteState.open && !shortcutsOpen}
        query={paletteState.query}
        selectedIndex={paletteState.selectedIndex}
        commands={commands}
      />
      {shortcutsOpen ? <ShortcutsOverlay /> : null}
      <PromptInput
        mode={mode}
        disabled={isProcessing || shortcutsOpen}
        projectRoot={projectRoot}
        onSubmit={handleSubmit}
        onCommand={handleCommand}
        onModeChange={handleModeChange}
        onShortcuts={() => {
          setShortcutsOpen(true)
          setPaletteState({ open: false, query: "", selectedIndex: 0 })
        }}
        onPaletteChange={setPaletteState}
        commands={commands}
      />

      {/* Status bar */}
      <StatusBar
        status={state.status}
        totalInputTokens={state.totalInputTokens}
        totalOutputTokens={state.totalOutputTokens}
        totalEstimatedCostUsd={state.totalEstimatedCostUsd}
        mode={mode}
        providerOverride={state.providerOverride}
        privacyMode={state.privacyMode}
        model={state.model}
        routingMode={state.routingMode}
      />
    </Box>
  )
}
