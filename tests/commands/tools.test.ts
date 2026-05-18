/** @Owl.Tests.Commands.Tools - Regression tests for /tools command */
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { Effect } from "effect"
import { BuiltInTools, makeBuiltInToolsLive } from "../../src/tools/index.js"
import {
  ToolPermissionState,
  ToolPermissionStateLive,
} from "../../src/tools/permissionState.js"
import { makeToolsCommand } from "../../src/commands/management/tools.js"

let projectRoot = ""

const runToolsCommand = (): Promise<string> =>
  Effect.runPromise(
    Effect.gen(function* () {
      const tools = yield* BuiltInTools
      const permissionState = yield* ToolPermissionState
      const command = makeToolsCommand(tools, permissionState)
      const result = yield* command.execute([])
      return result.output
    }).pipe(
      Effect.provide(makeBuiltInToolsLive(projectRoot)),
      Effect.provide(ToolPermissionStateLive),
    ),
  )

beforeEach(async () => {
  projectRoot = await mkdtemp(join(tmpdir(), "owl-tools-command-"))
})

afterEach(async () => {
  await rm(projectRoot, { recursive: true, force: true })
})

describe("/tools command", () => {
  it("shows model-visible and internal-only built-in tools", async () => {
    const output = await runToolsCommand()

    expect(output).toContain("Built-in Tools")
    expect(output).toContain("Model-visible")
    expect(output).toContain("✓ Read [low")
    expect(output).toContain("permission: allow")
    expect(output).toContain("mode: default")
    expect(output).toContain("✓ Glob [low")
    expect(output).toContain("✓ Grep [low")
    expect(output).toContain("Internal-only")
    expect(output).toContain("• Bash [high")
    expect(output).toContain("permission: ask")
    expect(output).toContain("• Write [medium")
    expect(output).toContain("• Edit [medium")
  })
})
