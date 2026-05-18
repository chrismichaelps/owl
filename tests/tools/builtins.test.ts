/** @Owl.Tests.Tools.BuiltIns - Regression tests for built-in agent tools */
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { Chunk, Effect } from "effect"
import {
  TOOL_CONSTANTS,
  TOOL_NAMES,
  TOOL_PERMISSION_MODES,
} from "../../src/core/constants/index.js"
import { ToolExecutionError } from "../../src/core/errors/index.js"
import {
  makeBuiltInToolsLive,
  makeBuiltInToolsRuntimeLive,
  BuiltInTools,
  ToolPermissionState,
  ToolPermissionStateLive,
} from "../../src/tools/index.js"

let projectRoot = ""

const runTool = (
  name: string,
  input: Record<string, unknown>,
): Promise<string> =>
  Effect.runPromise(
    Effect.gen(function* () {
      const tools = yield* BuiltInTools
      return yield* tools.callTool(name, input)
    }).pipe(
      Effect.provide(makeBuiltInToolsLive(projectRoot)),
      Effect.provide(ToolPermissionStateLive),
    ),
  )

const runToolEither = (name: string, input: Record<string, unknown>) =>
  Effect.runPromise(
    Effect.gen(function* () {
      const tools = yield* BuiltInTools
      return yield* tools.callTool(name, input).pipe(Effect.either)
    }).pipe(
      Effect.provide(makeBuiltInToolsLive(projectRoot)),
      Effect.provide(ToolPermissionStateLive),
    ),
  )

const runToolWithMode = (
  mode: typeof TOOL_PERMISSION_MODES.BYPASS_PERMISSIONS,
  name: string,
  input: Record<string, unknown>,
): Promise<string> =>
  Effect.runPromise(
    Effect.gen(function* () {
      const permissionState = yield* ToolPermissionState
      yield* permissionState.setMode(mode)
      const tools = yield* BuiltInTools
      return yield* tools.callTool(name, input)
    }).pipe(
      Effect.provide(makeBuiltInToolsLive(projectRoot)),
      Effect.provide(ToolPermissionStateLive),
    ),
  )

beforeEach(async () => {
  projectRoot = await mkdtemp(join(tmpdir(), "owl-tools-"))
})

afterEach(async () => {
  await rm(projectRoot, { recursive: true, force: true })
})

describe("BuiltInTools", () => {
  it("lists only model-visible read tools as descriptors", async () => {
    const names = await Effect.runPromise(
      Effect.gen(function* () {
        const tools = yield* BuiltInTools
        return Chunk.toReadonlyArray(
          Chunk.map(tools.getTools(), (tool) => tool.name),
        )
      }).pipe(
        Effect.provide(makeBuiltInToolsLive(projectRoot)),
        Effect.provide(ToolPermissionStateLive),
      ),
    )

    expect(names).toContain(TOOL_NAMES.READ)
    expect(names).toContain(TOOL_NAMES.GLOB)
    expect(names).toContain(TOOL_NAMES.GREP)
    expect(names).not.toContain(TOOL_NAMES.WRITE)
    expect(names).not.toContain(TOOL_NAMES.EDIT)
    expect(names).not.toContain(TOOL_NAMES.BASH)
  })

  it("exposes ToolRisk assessments for built-in tools", async () => {
    const risk = await Effect.runPromise(
      Effect.gen(function* () {
        const tools = yield* BuiltInTools
        return tools.assessToolRisk(TOOL_NAMES.BASH, {
          command: "rm -rf dist",
        })
      }).pipe(
        Effect.provide(makeBuiltInToolsLive(projectRoot)),
        Effect.provide(ToolPermissionStateLive),
      ),
    )

    expect(risk.level).toBe("blocked")
  })

  it("exposes Permission decisions for built-in tools", async () => {
    const permission = await Effect.runPromise(
      Effect.gen(function* () {
        const tools = yield* BuiltInTools
        return tools.assessToolPermission(TOOL_NAMES.BASH, {
          command: "node scripts/migrate.js",
        })
      }).pipe(
        Effect.provide(makeBuiltInToolsLive(projectRoot)),
        Effect.provide(ToolPermissionStateLive),
      ),
    )

    expect(permission.behavior).toBe("ask")
    expect(permission.risk.level).toBe("high")
  })

  it("requires permission for high-risk Bash invocations in default mode", async () => {
    const result = await runToolEither(TOOL_NAMES.BASH, {
      command: "sleep 1",
      timeout_ms: TOOL_CONSTANTS.BASH_MIN_TIMEOUT_MS,
    })

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left).toBeInstanceOf(ToolExecutionError)
      expect(result.left.reason).toContain("Permission required")
    }
  })

  it("shares Permission mode state with built-in tool execution", async () => {
    const output = await Effect.runPromise(
      Effect.gen(function* () {
        const permissionState = yield* ToolPermissionState
        yield* permissionState.setMode(TOOL_PERMISSION_MODES.BYPASS_PERMISSIONS)
        const tools = yield* BuiltInTools
        return yield* tools.callTool(TOOL_NAMES.BASH, {
          command: "pwd",
          timeout_ms: TOOL_CONSTANTS.BASH_MIN_TIMEOUT_MS,
        })
      }).pipe(Effect.provide(makeBuiltInToolsRuntimeLive(projectRoot))),
    )

    expect(output).toContain(projectRoot)
  })

  it("denies blocked ToolRisk invocations before execution", async () => {
    await writeFile(join(projectRoot, "keep.txt"), "safe\n")

    const result = await runToolEither(TOOL_NAMES.BASH, {
      command: "rm -rf keep.txt",
    })

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left).toBeInstanceOf(ToolExecutionError)
      expect(result.left.reason).toContain("Blocked ToolRisk")
    }
    await expect(readFile(join(projectRoot, "keep.txt"), "utf8")).resolves.toBe(
      "safe\n",
    )
  })

  it("writes, reads, and edits files inside the project root", async () => {
    const writeOutput = await runTool(TOOL_NAMES.WRITE, {
      file_path: "src/example.txt",
      content: "one\ntwo\n",
    })
    expect(writeOutput).toContain("src/example.txt")
    expect(writeOutput).not.toContain(projectRoot)

    const readOutput = await runTool(TOOL_NAMES.READ, {
      file_path: "src/example.txt",
    })
    expect(readOutput).toContain("1\tone")
    expect(readOutput).toContain("2\ttwo")

    const editOutput = await runTool(TOOL_NAMES.EDIT, {
      file_path: "src/example.txt",
      old_string: "two",
      new_string: "three",
    })
    expect(editOutput).toContain("src/example.txt")
    expect(editOutput).not.toContain(projectRoot)

    await expect(
      readFile(join(projectRoot, "src/example.txt"), "utf8"),
    ).resolves.toBe("one\nthree\n")
  })

  it("rejects paths that escape the project root", async () => {
    const result = await runToolEither(TOOL_NAMES.READ, {
      file_path: "../outside.txt",
    })

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left).toBeInstanceOf(ToolExecutionError)
    }
  })

  it("finds files and content through Glob and Grep", async () => {
    await writeFile(join(projectRoot, "alpha.ts"), "export const alpha = 1\n")
    await writeFile(join(projectRoot, "beta.ts"), "export const beta = 2\n")

    const globOutput = await runTool(TOOL_NAMES.GLOB, { pattern: "*.ts" })
    expect(globOutput).toContain("alpha.ts")
    expect(globOutput).toContain("beta.ts")
    expect(globOutput).not.toContain(projectRoot)

    const grepOutput = await runTool(TOOL_NAMES.GREP, {
      pattern: "alpha",
      include: "*.ts",
    })
    expect(grepOutput).toContain("alpha.ts")
    expect(grepOutput).not.toContain(projectRoot)
  })

  it("clamps Bash timeouts to the configured minimum", async () => {
    const output = await runToolWithMode(
      TOOL_PERMISSION_MODES.BYPASS_PERMISSIONS,
      TOOL_NAMES.BASH,
      {
        command: "sleep 2",
        timeout_ms: 1,
      },
    )

    expect(output).toContain(
      "[Timed out after " + String(TOOL_CONSTANTS.BASH_MIN_TIMEOUT_MS) + "ms]",
    )
  })

  it("returns a tagged error for unknown built-in tools", async () => {
    const result = await runToolEither("MissingTool", {})

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left).toBeInstanceOf(ToolExecutionError)
    }
  })

  it("validates tool input schemas before execution", async () => {
    const readResult = await runToolEither(TOOL_NAMES.READ, {
      file_path: 42,
    })
    const writeResult = await runToolEither(TOOL_NAMES.WRITE, {
      file_path: "out.txt",
      content: false,
    })
    const grepResult = await runToolEither(TOOL_NAMES.GREP, {
      pattern: ["not", "a", "regex"],
    })

    expect(readResult._tag).toBe("Left")
    expect(writeResult._tag).toBe("Left")
    expect(grepResult._tag).toBe("Left")
    if (readResult._tag === "Left") {
      expect(readResult.left.reason).toContain("Invalid tool input")
    }
    if (writeResult._tag === "Left") {
      expect(writeResult.left.reason).toContain("Invalid tool input")
    }
    if (grepResult._tag === "Left") {
      expect(grepResult.left.reason).toContain("Invalid tool input")
    }
  })
})
