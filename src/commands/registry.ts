/** @Owl.Commands.Registry - Ref-backed command lookup and dispatch service */
import { Context, Effect, Layer, Ref } from "effect"
import {
  CommandNotFoundError,
  CommandParseError,
} from "../core/errors/index.js"
import type { CommandHandler, CommandResult, ParsedCommand } from "./types.js"

/** @Owl.Commands.Registry.Service - Register, lookup, list, and dispatch commands */
export interface CommandRegistryService {
  readonly register: (handler: CommandHandler) => Effect.Effect<void>
  readonly lookup: (
    name: string,
  ) => Effect.Effect<CommandHandler, CommandNotFoundError>
  readonly list: () => Effect.Effect<
    ReadonlyArray<{ readonly name: string; readonly description: string }>
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
    ReadonlyArray<{ readonly name: string; readonly description: string }>
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
