/** @Owl.Tests.Commands.Permissions - Permission mode command regressions */
import { describe, expect, it } from "vitest"
import { Effect } from "effect"
import { TOOL_PERMISSION_MODES } from "../../src/core/constants/index.js"
import {
  ToolPermissionState,
  ToolPermissionStateLive,
} from "../../src/tools/permissionState.js"
import { makePermissionsCommand } from "../../src/commands/management/permissions.js"

const run = <A>(effect: Effect.Effect<A, unknown, ToolPermissionState>) =>
  Effect.runPromise(effect.pipe(Effect.provide(ToolPermissionStateLive)))

describe("makePermissionsCommand", () => {
  it("shows the current Permission mode", async () => {
    const output = await run(
      Effect.gen(function* () {
        const state = yield* ToolPermissionState
        const command = makePermissionsCommand(state)
        const result = yield* command.execute([])
        return result.output
      }),
    )

    expect(output).toContain("Permission mode: default")
    expect(output).toContain("Available modes:")
  })

  it("sets the current Permission mode", async () => {
    const mode = await run(
      Effect.gen(function* () {
        const state = yield* ToolPermissionState
        const command = makePermissionsCommand(state)
        yield* command.execute([TOOL_PERMISSION_MODES.PLAN])
        return yield* state.getMode()
      }),
    )

    expect(mode).toBe(TOOL_PERMISSION_MODES.PLAN)
  })

  it("rejects unknown Permission modes", async () => {
    const result = await Effect.runPromiseExit(
      Effect.gen(function* () {
        const state = yield* ToolPermissionState
        const command = makePermissionsCommand(state)
        return yield* command.execute(["auto"])
      }).pipe(Effect.provide(ToolPermissionStateLive)),
    )

    expect(result._tag).toBe("Failure")
  })
})
