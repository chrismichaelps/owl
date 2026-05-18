/** @Owl.Tests.Tools.PermissionState - Permission mode state regressions */
import { describe, expect, it } from "vitest"
import { Chunk, Effect, Option } from "effect"
import {
  TOOL_PERMISSION_MODES,
  TOOL_PERMISSION_MODE_ORDER,
} from "../../src/core/constants/index.js"
import {
  parseToolPermissionMode,
  ToolPermissionState,
  ToolPermissionStateLive,
} from "../../src/tools/permissionState.js"

const run = <A>(effect: Effect.Effect<A, never, ToolPermissionState>) =>
  Effect.runPromise(effect.pipe(Effect.provide(ToolPermissionStateLive)))

describe("ToolPermissionState", () => {
  it("defaults to default Permission mode", async () => {
    const mode = await run(
      Effect.gen(function* () {
        const state = yield* ToolPermissionState
        return yield* state.getMode()
      }),
    )

    expect(mode).toBe(TOOL_PERMISSION_MODES.DEFAULT)
  })

  it("sets and snapshots Permission mode", async () => {
    const snapshot = await run(
      Effect.gen(function* () {
        const state = yield* ToolPermissionState
        yield* state.setMode(TOOL_PERMISSION_MODES.PLAN)
        return yield* state.snapshot()
      }),
    )

    expect(snapshot.mode).toBe(TOOL_PERMISSION_MODES.PLAN)
    expect(Chunk.toReadonlyArray(snapshot.modes)).toEqual(
      Chunk.toReadonlyArray(TOOL_PERMISSION_MODE_ORDER),
    )
  })

  it("parses valid Permission modes only", () => {
    expect(parseToolPermissionMode("plan")).toEqual(
      Option.some(TOOL_PERMISSION_MODES.PLAN),
    )
    expect(parseToolPermissionMode("invalid")).toEqual(Option.none())
  })
})
