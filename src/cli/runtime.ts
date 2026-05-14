/** @Owl.CLI.Runtime - ManagedRuntime factory wiring all live Effect layers */
import { Layer, ManagedRuntime } from "effect"
import { OrchestratorLive } from "../engine/orchestrator/index.js"
import { ContextManagerLive } from "../engine/context/index.js"
import { SessionMemoryLive } from "../engine/memory/index.js"
import { ProviderRouterLive } from "../providers/router/index.js"
import { RoleContextLive } from "../fmcf/roles/architect.js"
import { EditingPipelineLive } from "../editor/pipeline/index.js"
import { RollbackSystemLive } from "../editor/rollback/index.js"
import { DiffGeneratorLive } from "../editor/diff/index.js"
import { TLIExecutorLive } from "../editor/tli/index.js"
import { GovernanceEngineLive } from "../fmcf/governance/index.js"
import { makeCommandRegistryLive } from "../commands/registry.js"
import type { Orchestrator } from "../engine/orchestrator/index.js"
import type { CommandRegistry } from "../commands/registry.js"

/** @Owl.CLI.Runtime.Type - Typed ManagedRuntime exposing Orchestrator + CommandRegistry */
export type OwlRuntime = ManagedRuntime.ManagedRuntime<
  Orchestrator | CommandRegistry,
  never
>

/** @Owl.CLI.Runtime.Make - Factory; call once per CLI session with the project root */
export const makeOwlRuntime = (projectRoot: string): OwlRuntime => {
  // Self-sufficient leaf layers (provide their own infrastructure)
  const leafLayer = Layer.mergeAll(
    ContextManagerLive,
    SessionMemoryLive,
    ProviderRouterLive,
    RoleContextLive,
    RollbackSystemLive,
    GovernanceEngineLive,
    DiffGeneratorLive,
    TLIExecutorLive,
  )

  // Derive higher-order layers by providing the shared leaf environment once each
  const orchestratorLayer = OrchestratorLive.pipe(Layer.provide(leafLayer))
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
    Layer.mergeAll(orchestratorLayer, commandRegistryLayer),
  )
}
