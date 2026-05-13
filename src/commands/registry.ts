/** @Owl.Commands.Registry - Ref-backed command lookup and dispatch service */
import { FileSystem } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"
import { Context, Effect, Layer, Ref } from "effect"
import { ContextManager } from "../engine/context/index.js"
import { Orchestrator } from "../engine/orchestrator/index.js"
import { SessionMemory } from "../engine/memory/index.js"
import { RoleContext } from "../fmcf/roles/architect.js"
import { HashRegistry } from "../fmcf/registry/index.js"
import { HashRegistryLive } from "../fmcf/registry/index.js"
import { EditingPipeline } from "../editor/pipeline/index.js"
import { RollbackSystem } from "../editor/rollback/index.js"
import { makeAnalyzeCommand } from "./analysis/analyze.js"
import { makeBrainCommand } from "./analysis/brain.js"
import { makeDepthCommand } from "./analysis/depth.js"
import { makeFrictionCommand } from "./analysis/friction.js"
import { makeGrillCommand } from "./analysis/grill.js"
import { makeSeamsCommand } from "./analysis/seams.js"
import { makeDeepCommand } from "./core/deep.js"
import { makePlanCommand } from "./core/plan.js"
import { makeQuickCommand } from "./core/quick.js"
import { makeTaskCommand } from "./core/task.js"
import { makeApplyCommand } from "./editing/apply.js"
import { makeCreateCommand } from "./editing/create.js"
import { makeDiffCommand } from "./editing/diff.js"
import { makeEditCommand } from "./editing/edit.js"
import { makeInjectCommand } from "./editing/inject.js"
import { makeRefactorCommand } from "./editing/refactor.js"
import { makeUndoCommand } from "./editing/undo.js"
import { makeAuditCommand } from "./management/audit.js"
import { makeClearCommand } from "./management/clear.js"
import { makeMemoryCommand } from "./management/memory.js"
import { makeModelCommand } from "./management/model.js"
import { makeRegistryCommand } from "./management/registry.js"
import { makeRoleCommand } from "./management/role.js"
import { makeStatusCommand } from "./management/status.js"
import { makeEconomyCommand } from "./power/economy.js"
import { makeGodCommand } from "./power/god.js"
import { makeRawCommand } from "./power/raw.js"
import type { CommandParseError } from "../core/errors/index.js"
import { CommandNotFoundError } from "../core/errors/index.js"
import type { CommandHandler, CommandResult, ParsedCommand } from "./types.js"

/** @Owl.Commands.Registry.Service - Register, lookup, list, and dispatch commands */
export interface CommandRegistryService {
  readonly register: (handler: CommandHandler) => Effect.Effect<void>
  readonly lookup: (
    name: string,
  ) => Effect.Effect<CommandHandler, CommandNotFoundError>
  readonly list: () => Effect.Effect<
    readonly { readonly name: string; readonly description: string }[]
  >
  readonly dispatch: (
    parsed: ParsedCommand,
  ) => Effect.Effect<CommandResult, CommandNotFoundError | CommandParseError>
}

export class CommandRegistry extends Context.Tag("CommandRegistry")<
  CommandRegistry,
  CommandRegistryService
>() {}

/** @Owl.Commands.Registry.buildService - Shared factory used by bare Live and full-wired variants */
export const buildRegistryService = (
  mapRef: Ref.Ref<Map<string, CommandHandler>>,
): CommandRegistryService => {
  const register = (handler: CommandHandler): Effect.Effect<void> =>
    Ref.update(mapRef, (map) => {
      const next = new Map(map)
      next.set(handler.name, handler)
      return next
    })

  const lookup = (
    name: string,
  ): Effect.Effect<CommandHandler, CommandNotFoundError> =>
    Ref.get(mapRef).pipe(
      Effect.flatMap((map) => {
        const handler = map.get(name)
        return handler !== undefined
          ? Effect.succeed(handler)
          : Effect.fail(new CommandNotFoundError({ command: name }))
      }),
    )

  const list = (): Effect.Effect<
    readonly { readonly name: string; readonly description: string }[]
  > =>
    Ref.get(mapRef).pipe(
      Effect.map((map) =>
        Array.from(map.values()).map((h) => ({
          name: h.name,
          description: h.description,
        })),
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

/** @Owl.Commands.Registry.Live - Bare Ref-backed registry — no commands pre-registered. Used in tests. */
export const CommandRegistryLive = Layer.effect(
  CommandRegistry,
  Effect.gen(function* () {
    const mapRef = yield* Ref.make<Map<string, CommandHandler>>(new Map())
    return buildRegistryService(mapRef)
  }),
)

/** @Owl.Commands.Registry.makeCommandRegistryLive - Full composition root: yields all services, registers all handlers */
export const makeCommandRegistryLive = (
  projectRoot: string,
): Layer.Layer<
  CommandRegistry,
  never,
  | Orchestrator
  | ContextManager
  | SessionMemory
  | RoleContext
  | RollbackSystem
  | EditingPipeline
> =>
  Layer.effect(
    CommandRegistry,
    Effect.gen(function* () {
      const orchestrator = yield* Orchestrator
      const hashRegistry = yield* HashRegistry
      const rollback = yield* RollbackSystem
      const pipeline = yield* EditingPipeline
      const sessionMemory = yield* SessionMemory
      const contextManager = yield* ContextManager
      const fs = yield* FileSystem.FileSystem
      const roleCtx = yield* RoleContext

      const mapRef = yield* Ref.make<Map<string, CommandHandler>>(new Map())
      const svc = buildRegistryService(mapRef)

      const handlers: CommandHandler[] = [
        // Core
        makeTaskCommand(orchestrator),
        makeDeepCommand(orchestrator),
        makeQuickCommand(orchestrator),
        makePlanCommand(orchestrator),
        // Power
        makeRawCommand(orchestrator),
        makeGodCommand(orchestrator),
        makeEconomyCommand(orchestrator),
        // Analysis
        makeAnalyzeCommand(orchestrator),
        makeBrainCommand(hashRegistry),
        makeSeamsCommand(hashRegistry),
        makeDepthCommand(orchestrator),
        makeFrictionCommand(orchestrator),
        makeGrillCommand(orchestrator),
        // Editing
        makeEditCommand(pipeline, projectRoot),
        makeInjectCommand(pipeline, projectRoot),
        makeCreateCommand(fs, projectRoot),
        makeRefactorCommand(orchestrator),
        makeDiffCommand(rollback),
        makeApplyCommand(),
        makeUndoCommand(rollback, projectRoot),
        // Management
        makeRoleCommand(roleCtx),
        makeRegistryCommand(hashRegistry),
        makeAuditCommand(orchestrator),
        makeStatusCommand(sessionMemory),
        makeClearCommand(contextManager),
        makeMemoryCommand(sessionMemory),
        makeModelCommand(),
      ]

      yield* Effect.forEach(handlers, svc.register, { discard: true })

      return svc
    }),
  ).pipe(
    Layer.provide(NodeFileSystem.layer),
    Layer.provide(HashRegistryLive(projectRoot)),
  )
