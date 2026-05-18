/**
 * @Owl.Commands.Registry - Ref-backed command lookup and dispatch service
 *
 * Central command management service. All slash commands are registered here
 * at startup by makeCommandRegistryLive().
 *
 * Commands are organized by category:
 * - Core: task, deep, quick, plan
 * - Power: raw, compare, god, economy
 * - Analysis: analyze, brain, depth, friction, grill, seams
 * - Editing: edit, inject, create, diff, apply, undo, refactor
 * - Management: role, registry, audit, status, clear, memory, model
 *
 * @example
 * yield* Effect.flatMap(CommandRegistry, (r) => r.register(handler))
 * const handler = yield* Effect.flatMap(CommandRegistry, (r) => r.lookup("edit"))
 * const result = yield* Effect.flatMap(CommandRegistry, (r) => r.dispatch(parsed))
 */
import { FileSystem } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"
import {
  Chunk,
  Context,
  Data,
  Effect,
  HashMap,
  Layer,
  Option,
  Order,
  Ref,
} from "effect"
import { ContextManager } from "../engine/context/index.js"
import { UsageMetrics } from "../engine/metrics/index.js"
import { Orchestrator } from "../engine/orchestrator/index.js"
import { SessionMemory } from "../engine/memory/index.js"
import { ContextCache } from "../tokens/cache/index.js"
import { RoleContext } from "../fmcf/roles/architect.js"
import { HashRegistry } from "../fmcf/registry/index.js"
import { HashRegistryLive } from "../fmcf/registry/index.js"
import { McpManager } from "../mcp/index.js"
import { RoutingPreferences } from "../providers/preferences/index.js"
import { ProviderRouter } from "../providers/router/index.js"
import { BuiltInTools } from "../tools/index.js"
import { ToolPermissionState } from "../tools/index.js"
import { EditingPipeline } from "../editor/pipeline/index.js"
import { PendingMutationStore } from "../editor/pending/index.js"
import { RollbackSystem } from "../editor/rollback/index.js"
import { makeCommandHandlers, makeHelpHandler } from "./factory.js"
import type { CommandParseError } from "../core/errors/index.js"
import { CommandNotFoundError } from "../core/errors/index.js"
import type { CommandHandler, CommandResult, ParsedCommand } from "./types.js"

/**
 * @Owl.Commands.Registry.Service - Register, lookup, list, and dispatch commands
 */
export interface CommandRegistryService {
  /**
   * Register a command handler
   *
   * @param handler - CommandHandler to add
   */
  readonly register: (handler: CommandHandler) => Effect.Effect<void>
  /**
   * Look up a command by name
   *
   * @param name - Command name (without /)
   * @returns CommandHandler
   * @throws CommandNotFoundError - If command doesn't exist
   */
  readonly lookup: (
    name: string,
  ) => Effect.Effect<CommandHandler, CommandNotFoundError>
  /**
   * List all registered commands
   *
   * @returns Chunk of { name, description }
   */
  readonly list: () => Effect.Effect<
    Chunk.Chunk<{ readonly name: string; readonly description: string }>
  >
  /**
   * Dispatch a parsed command to its handler
   *
   * @param parsed - ParsedCommand from parseCommand()
   * @returns CommandResult with output
   * @throws CommandNotFoundError - If command doesn't exist
   */
  readonly dispatch: (
    parsed: ParsedCommand,
  ) => Effect.Effect<CommandResult, CommandNotFoundError | CommandParseError>
}

export class CommandRegistry extends Context.Tag("CommandRegistry")<
  CommandRegistry,
  CommandRegistryService
>() {}

/**
 * @Owl.Commands.Registry.buildService - Shared factory used by bare Live and full-wired variants
 *
 * Builds the core registry service from a Ref<HashMap>.
 * Used by both CommandRegistryLive (bare, for tests) and makeCommandRegistryLive (full).
 */
export const buildRegistryService = (
  mapRef: Ref.Ref<HashMap.HashMap<string, CommandHandler>>,
): CommandRegistryService => {
  const register = (handler: CommandHandler): Effect.Effect<void> =>
    Ref.update(mapRef, (map) => HashMap.set(map, handler.name, handler))

  const lookup = (
    name: string,
  ): Effect.Effect<CommandHandler, CommandNotFoundError> =>
    Ref.get(mapRef).pipe(
      Effect.flatMap((map) => {
        const handler = HashMap.get(map, name)
        return Option.match(handler, {
          onNone: () =>
            Effect.fail(new CommandNotFoundError({ command: name })),
          onSome: Effect.succeed,
        })
      }),
    )

  const list = (): Effect.Effect<
    Chunk.Chunk<{ readonly name: string; readonly description: string }>
  > =>
    Ref.get(mapRef).pipe(
      Effect.map((map) =>
        Chunk.sortWith(
          Chunk.map(Chunk.fromIterable(HashMap.values(map)), (handler) =>
            Data.struct({
              name: handler.name,
              description: handler.description,
            }),
          ),
          (command) => command.name,
          Order.string,
        ),
      ),
    )

  const dispatch = (
    parsed: ParsedCommand,
  ): Effect.Effect<CommandResult, CommandNotFoundError | CommandParseError> =>
    Effect.gen(function* () {
      const handler = yield* lookup(parsed.name)
      return yield* handler.execute(parsed.args)
    })

  return { register, lookup, list, dispatch }
}

/**
 * @Owl.Commands.Registry.Live - Bare Ref-backed registry — no commands pre-registered. Used in tests.
 */
export const CommandRegistryLive = Layer.effect(
  CommandRegistry,
  Effect.gen(function* () {
    const mapRef = yield* Ref.make<HashMap.HashMap<string, CommandHandler>>(
      HashMap.empty(),
    )
    return buildRegistryService(mapRef)
  }),
)

/**
 * @Owl.Commands.Registry.makeCommandRegistryLive - Full composition root: yields all services, registers all handlers
 *
 * Wires together all services needed by commands:
 * - Orchestrator (for inference commands)
 * - HashRegistry (for registry commands)
 * - EditingPipeline (for editing commands)
 * - RollbackSystem (for undo/diff commands)
 * - ContextManager (for clear command)
 * - ContextCache (for compact/cache commands)
 * - SessionMemory (for memory/status commands)
 * - RoleContext (for role command)
 * - RoutingPreferences (for model command)
 * - ProviderRouter (for provider inspection commands)
 *
 * Registers all commands on startup.
 */
export const makeCommandRegistryLive = (
  projectRoot: string,
): Layer.Layer<
  CommandRegistry,
  never,
  | Orchestrator
  | ContextManager
  | ContextCache
  | UsageMetrics
  | SessionMemory
  | RoleContext
  | RollbackSystem
  | EditingPipeline
  | PendingMutationStore
  | McpManager
  | RoutingPreferences
  | ProviderRouter
  | BuiltInTools
  | ToolPermissionState
> =>
  Layer.effect(
    CommandRegistry,
    Effect.gen(function* () {
      const orchestrator = yield* Orchestrator
      const hashRegistry = yield* HashRegistry
      const rollback = yield* RollbackSystem
      const pipeline = yield* EditingPipeline
      const pendingMutations = yield* PendingMutationStore
      const mcpManager = yield* McpManager
      const sessionMemory = yield* SessionMemory
      const usageMetrics = yield* UsageMetrics
      const contextManager = yield* ContextManager
      const contextCache = yield* ContextCache
      const fs = yield* FileSystem.FileSystem
      const roleCtx = yield* RoleContext
      const routingPreferences = yield* RoutingPreferences
      const providerRouter = yield* ProviderRouter
      const builtInTools = yield* BuiltInTools
      const toolPermissionState = yield* ToolPermissionState

      const mapRef = yield* Ref.make<HashMap.HashMap<string, CommandHandler>>(
        HashMap.empty(),
      )
      const svc = buildRegistryService(mapRef)

      const handlers = makeCommandHandlers(
        {
          orchestrator,
          hashRegistry,
          rollback,
          pipeline,
          pendingMutations,
          mcpManager,
          sessionMemory,
          usageMetrics,
          contextManager,
          contextCache,
          fs,
          roleCtx,
          routingPreferences,
          providerRouter,
          builtInTools,
          toolPermissionState,
        },
        projectRoot,
      )

      yield* Effect.forEach(handlers, svc.register, { discard: true })
      yield* svc.register(makeHelpHandler(svc))

      return svc
    }),
  ).pipe(
    Layer.provide(NodeFileSystem.layer),
    Layer.provide(HashRegistryLive(projectRoot)),
  )
