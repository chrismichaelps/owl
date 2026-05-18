/**
 * @Owl.CLI.Runtime - ManagedRuntime factory wiring all live Effect layers
 *
 * Composes all services into a ManagedRuntime for the CLI.
 * Layer composition follows dependency order:
 *
 * 1. Leaf layers (no dependencies):
 *    - OWLConfigLive
 *    - ContextManagerLive
 *    - SessionMemoryLive
 *    - UsageMetricsLive
 *    - ProviderRouterLive
 *    - RoutingPreferencesLive
 *    - Provider adapter layers
 *    - RoleContextLive
 *    - RollbackSystemLive
 *    - GovernanceEngineLive
 *    - DiffGeneratorLive
 *    - TLIExecutorLive
 *    - TokenBudgetLive
 *
 * 2. Derived layers:
 *    - ProviderBootstrapLive (requires: config, router, adapters)
 *    - OrchestratorLive (requires: context, memory, router)
 *    - EditingPipelineLive (requires: governance, diff, tli, rollback)
 *    - PendingMutationStoreLive (requires: none)
 *
 * 3. Aggregate layers:
 *    - CommandRegistryLive (requires: all services + all commands)
 *
 * The ManagedRuntime lifetime: create on app start, dispose on app exit.
 *
 * @example
 * const runtime = makeOwlRuntime(process.cwd())
 * runtime.runPromise(effect) // Execute Effect in managed context
 * await runtime.dispose() // Clean up on exit
 */
import { Effect, Layer, ManagedRuntime } from "effect"
import path from "node:path"
import { loadMcpConfig, makeMcpManagerLayer } from "../mcp/index.js"
import { makeBuiltInToolsRuntimeLive } from "../tools/index.js"
import { OWLConfigLive } from "../core/config/index.js"
import {
  CACHE_CONSTANTS,
  SESSION_MEMORY_CONSTANTS,
} from "../core/constants/index.js"
import {
  Orchestrator,
  makeOrchestratorLive,
} from "../engine/orchestrator/index.js"
import { ContextManagerLive } from "../engine/context/index.js"
import { UsageMetricsLive } from "../engine/metrics/index.js"
import { makePersistentSessionMemoryLive } from "../engine/memory/index.js"
import { ProviderRouterLive } from "../providers/router/index.js"
import { RoutingPreferencesLive } from "../providers/preferences/index.js"
import { AnthropicAdapterLive } from "../providers/anthropic/index.js"
import { GoogleAdapterLive } from "../providers/google/index.js"
import { OllamaAdapterLive } from "../providers/ollama/index.js"
import { OpenAIAdapterLive } from "../providers/openai/index.js"
import {
  ProviderBootstrap,
  ProviderBootstrapLive,
} from "../providers/bootstrap.js"
import { XAIAdapterLive } from "../providers/xai/index.js"
import { RoleContextLive } from "../fmcf/roles/architect.js"
import { EditingPipelineLive } from "../editor/pipeline/index.js"
import { PendingMutationStoreLive } from "../editor/pending/index.js"
import { RollbackSystemLive } from "../editor/rollback/index.js"
import { DiffGeneratorLive } from "../editor/diff/index.js"
import { TLIExecutorLive } from "../editor/tli/index.js"
import { GovernanceEngineLive } from "../fmcf/governance/index.js"
import { makeCommandRegistryLive } from "../commands/registry.js"
import { TokenBudgetLive } from "../tokens/budget/index.js"
import { makePersistentContextCacheLive } from "../tokens/cache/index.js"
import type { CommandRegistry } from "../commands/registry.js"
import type { RoutingPreferences } from "../providers/preferences/index.js"
import type { PendingMutationStore } from "../editor/pending/index.js"
import type { ContextCache } from "../tokens/cache/index.js"
import type { ConfigError } from "effect/ConfigError"
import type {
  CachePersistenceError,
  CacheValidationError,
  SessionMemoryPersistenceError,
  SessionMemoryValidationError,
} from "../core/errors/index.js"

/**
 * @Owl.CLI.Runtime.Type - Typed ManagedRuntime exposing Orchestrator + CommandRegistry
 *
 * The CLI only needs these two services:
 * - Orchestrator: For task execution
 * - CommandRegistry: For slash command handling
 */
export type OwlRuntime = ManagedRuntime.ManagedRuntime<
  | Orchestrator
  | CommandRegistry
  | RoutingPreferences
  | PendingMutationStore
  | ContextCache,
  | ConfigError
  | SessionMemoryPersistenceError
  | SessionMemoryValidationError
  | CachePersistenceError
  | CacheValidationError
>

/**
 * @Owl.CLI.Runtime.Make - Factory; call once per CLI session with the project root
 *
 * @param projectRoot - Absolute path to project root (typically process.cwd())
 * @returns ManagedRuntime with all services wired
 */
export const makeOwlRuntime = (projectRoot: string): OwlRuntime => {
  const sessionMemoryLayer = makePersistentSessionMemoryLive(
    path.join(
      projectRoot,
      SESSION_MEMORY_CONSTANTS.STORAGE_DIR,
      SESSION_MEMORY_CONSTANTS.STORAGE_FILE,
    ),
  )
  const contextCacheLayer = makePersistentContextCacheLive(
    path.join(
      projectRoot,
      CACHE_CONSTANTS.STORAGE_DIR,
      CACHE_CONSTANTS.STORAGE_FILE,
    ),
  )

  // Load MCP config and build manager layer — errors are non-fatal (empty config = no tools)
  const mcpManagerLayer = Layer.unwrapEffect(
    Effect.promise(() =>
      loadMcpConfig(projectRoot).then((config) => makeMcpManagerLayer(config)),
    ),
  )

  const toolRuntimeLayer = makeBuiltInToolsRuntimeLive(projectRoot)
  const providerSupportLayer = Layer.mergeAll(
    OWLConfigLive,
    mcpManagerLayer,
    toolRuntimeLayer,
  )

  const providerAdapterLayer = Layer.mergeAll(
    AnthropicAdapterLive,
    OpenAIAdapterLive,
    GoogleAdapterLive,
    XAIAdapterLive,
    OllamaAdapterLive,
  ).pipe(Layer.provide(providerSupportLayer))

  // Self-sufficient leaf layers plus Provider adapters.
  const leafLayer = Layer.mergeAll(
    providerSupportLayer,
    ContextManagerLive,
    contextCacheLayer,
    sessionMemoryLayer,
    UsageMetricsLive,
    ProviderRouterLive,
    RoutingPreferencesLive,
    providerAdapterLayer,
    RoleContextLive,
    RollbackSystemLive,
    PendingMutationStoreLive,
    GovernanceEngineLive,
    DiffGeneratorLive,
    TLIExecutorLive,
    TokenBudgetLive,
  )

  const providerBootstrapLayer = ProviderBootstrapLive.pipe(
    Layer.provide(leafLayer),
  )

  const orchestratorBaseLayer = makeOrchestratorLive(projectRoot).pipe(
    Layer.provide(leafLayer),
  )
  const orchestratorLayer = Layer.effect(
    Orchestrator,
    Effect.gen(function* () {
      yield* ProviderBootstrap
      return yield* Orchestrator
    }),
  ).pipe(
    Layer.provide(
      Layer.mergeAll(orchestratorBaseLayer, providerBootstrapLayer),
    ),
  )
  const editingPipelineLayer = EditingPipelineLive.pipe(
    Layer.provide(leafLayer),
  )

  // CommandRegistry depends on orchestratorLayer + editingPipelineLayer + remaining leaf services;
  // provide all of them as a single merged environment so leafLayer is shared via reference
  const commandRegistryLayer = makeCommandRegistryLive(projectRoot).pipe(
    Layer.provide(
      Layer.mergeAll(orchestratorLayer, editingPipelineLayer, leafLayer),
    ),
  )

  // Expose only the services the CLI actually uses
  return ManagedRuntime.make(
    Layer.mergeAll(orchestratorLayer, commandRegistryLayer, leafLayer),
  )
}
