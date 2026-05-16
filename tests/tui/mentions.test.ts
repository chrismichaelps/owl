/** @Owl.Tests.TUI.Mentions - File mention expansion safety tests */
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { expandMentions } from "../../src/tui/mentions/index.js"

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
