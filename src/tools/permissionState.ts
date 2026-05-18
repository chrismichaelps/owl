/** @Owl.Tools.PermissionState - Session-local Permission mode state */
import { Context, Data, Effect, HashSet, Layer, Option, Ref } from "effect"
import {
  TOOL_PERMISSION_MODE_ORDER,
  TOOL_PERMISSION_MODE_SET,
  TOOL_PERMISSION_MODES,
} from "../core/constants/index.js"
import type { ToolPermissionMode } from "./permission.js"
import type { Chunk } from "effect"

export type ToolPermissionSnapshot = Readonly<{
  readonly mode: ToolPermissionMode
  readonly modes: Chunk.Chunk<ToolPermissionMode>
}>

export interface ToolPermissionStateService {
  readonly getMode: () => Effect.Effect<ToolPermissionMode>
  readonly setMode: (mode: ToolPermissionMode) => Effect.Effect<void>
  readonly snapshot: () => Effect.Effect<ToolPermissionSnapshot>
}

/** @Owl.Tools.PermissionState.Tag - Effect service tag */
export class ToolPermissionState extends Context.Tag("ToolPermissionState")<
  ToolPermissionState,
  ToolPermissionStateService
>() {}

/** @Owl.Tools.PermissionState.Parse - Parse user Permission mode input */
export const parseToolPermissionMode = (
  value: string,
): Option.Option<ToolPermissionMode> => {
  const modeSet: HashSet.HashSet<string> = TOOL_PERMISSION_MODE_SET
  return HashSet.has(modeSet, value)
    ? Option.some(value as ToolPermissionMode)
    : Option.none()
}

/** @Owl.Tools.PermissionState.Make - Construct Ref-backed Permission state */
export const makeToolPermissionStateService =
  (): Effect.Effect<ToolPermissionStateService> =>
    Effect.gen(function* () {
      const modeRef = yield* Ref.make<ToolPermissionMode>(
        TOOL_PERMISSION_MODES.DEFAULT,
      )

      const getMode = (): Effect.Effect<ToolPermissionMode> => Ref.get(modeRef)

      const setMode = (mode: ToolPermissionMode): Effect.Effect<void> =>
        Ref.set(modeRef, mode)

      const snapshot = (): Effect.Effect<ToolPermissionSnapshot> =>
        Ref.get(modeRef).pipe(
          Effect.map((mode) =>
            Data.struct({
              mode,
              modes: TOOL_PERMISSION_MODE_ORDER,
            }),
          ),
        )

      return Data.struct({
        getMode,
        setMode,
        snapshot,
      })
    })

/** @Owl.Tools.PermissionState.Live - Ref-backed session Permission mode */
export const ToolPermissionStateLive = Layer.effect(
  ToolPermissionState,
  makeToolPermissionStateService(),
)
