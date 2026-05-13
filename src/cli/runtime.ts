/** @Owl.CLI.Runtime - ManagedRuntime factory wiring all live Effect layers */
import { Layer, ManagedRuntime } from "effect"
import { OrchestratorLive } from "../engine/orchestrator/index.js"
import { ContextManagerLive } from "../engine/context/index.js"
import { SessionMemoryLive } from "../engine/memory/index.js"
import { ProviderRouterLive } from "../providers/router/index.js"
import type { Orchestrator } from "../engine/orchestrator/index.js"

/** @Owl.CLI.Runtime.Layer - Full production layer composition */
export const OwlLiveLayer = OrchestratorLive.pipe(
  Layer.provide(ContextManagerLive),
  Layer.provide(SessionMemoryLive),
  Layer.provide(ProviderRouterLive),
)

/** @Owl.CLI.Runtime.Type - Typed ManagedRuntime for Owl session */
export type OwlRuntime = ManagedRuntime.ManagedRuntime<Orchestrator, never>

/** @Owl.CLI.Runtime.Make - Factory function; call once per CLI session */
export const makeOwlRuntime = (): OwlRuntime =>
  ManagedRuntime.make(OwlLiveLayer)
