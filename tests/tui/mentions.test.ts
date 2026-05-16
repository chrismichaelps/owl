/** @Owl.Tests.TUI.Mentions - File mention expansion safety tests */
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { MENTION_CONSTANTS } from "../../src/core/constants/index.js"
import { expandMentions } from "../../src/tui/mentions/index.js"
import {
  completeAtMention,
  extractAtQuery,
  filterFiles,
  listProjectFiles,
} from "../../src/tui/mentions/files.js"
import type { ProjectFile } from "../../src/tui/mentions/files.js"

let workspaceRoot = ""
let projectRoot = ""

beforeEach(async () => {
  workspaceRoot = await mkdtemp(join(tmpdir(), "owl-mentions-"))
  projectRoot = join(workspaceRoot, "project")
  await mkdir(join(projectRoot, "src"), { recursive: true })
})

afterEach(async () => {
  await rm(workspaceRoot, { recursive: true, force: true })
})

describe("expandMentions", () => {
  it("expands files inside the project root", async () => {
    await writeFile(join(projectRoot, "src", "a.ts"), "export const a = 1\n")

    const result = await expandMentions("Review @src/a.ts", projectRoot)

    expect(result.files).toEqual(["src/a.ts"])
    expect(result.errors).toEqual([])
    expect(result.expanded).toContain('<file path="src/a.ts">')
    expect(result.expanded).toContain("export const a = 1")
  })

  it("rejects mentions that escape the project root", async () => {
    await writeFile(join(workspaceRoot, "secret.txt"), "do not leak\n")

    const result = await expandMentions("Read @../secret.txt", projectRoot)

    expect(result.files).toEqual([])
    expect(result.errors).toEqual(["../secret.txt: path escapes project root"])
    expect(result.expanded).toBe("Read @../secret.txt")
  })
})

describe("file mention suggestions", () => {
  const files: readonly ProjectFile[] = [
    { path: "src/cli/runtime.ts", name: "runtime.ts" },
    { path: "src/tui/app.tsx", name: "app.tsx" },
    { path: "tests/tui/app.test.tsx", name: "app.test.tsx" },
    { path: "README.md", name: "README.md" },
    { path: "docs/MVP.md", name: "MVP.md" },
    { path: "src/providers/router/index.ts", name: "index.ts" },
    { path: "src/tools/read.ts", name: "read.ts" },
    { path: "src/tools/write.ts", name: "write.ts" },
    { path: "src/tools/edit.ts", name: "edit.ts" },
  ]

  it("extracts the active query at the end of the prompt", () => {
    expect(extractAtQuery("open @src/tui")).toBe("src/tui")
    expect(extractAtQuery("open @src\\tui")).toBe("src\\tui")
    expect(extractAtQuery("@")).toBe("")
    expect(extractAtQuery("open @src then continue")).toBeNull()
  })

  it("filters matches by path or filename within the visible suggestion limit", () => {
    const result = filterFiles(files, "app")

    expect(result.map((file) => file.path)).toEqual([
      "src/tui/app.tsx",
      "tests/tui/app.test.tsx",
    ])
  })

  it("bounds empty-query suggestions", () => {
    const result = filterFiles(files, "")

    expect(result).toHaveLength(MENTION_CONSTANTS.VISIBLE_SUGGESTION_COUNT)
    expect(result[0]?.path).toBe("src/cli/runtime.ts")
  })

  it("completes mentions without interpreting replacement tokens in paths", () => {
    const result = completeAtMention("inspect @src/", "src/$&file.ts")

    expect(result).toBe("inspect @src/$&file.ts")
  })

  it("lists project files deterministically while respecting ignore globs", async () => {
    await mkdir(join(projectRoot, "node_modules", "pkg"), { recursive: true })
    await writeFile(join(projectRoot, "b.ts"), "export const b = 1\n")
    await writeFile(join(projectRoot, "a.ts"), "export const a = 1\n")
    await writeFile(join(projectRoot, "node_modules", "pkg", "x.ts"), "x\n")
    await writeFile(join(projectRoot, "bun.lock"), "lock\n")

    const result = await listProjectFiles(projectRoot)

    expect(result.map((file) => file.path)).toEqual(["a.ts", "b.ts"])
  })
})
