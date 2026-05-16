/** @Owl.Tests.Editor.Pipeline - Mutation undo retention tests */
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { Effect, Layer } from "effect"
import {
  EditingPipeline,
  EditingPipelineLive,
} from "../../src/editor/pipeline/index.js"
import { DiffGeneratorLive } from "../../src/editor/diff/index.js"
import {
  RollbackSystem,
  RollbackSystemLive,
} from "../../src/editor/rollback/index.js"
import { TLIExecutorLive } from "../../src/editor/tli/index.js"
import { GovernanceEngineLive } from "../../src/fmcf/governance/index.js"

const pipelineDependencies = Layer.mergeAll(
  GovernanceEngineLive,
  DiffGeneratorLive,
  TLIExecutorLive,
  RollbackSystemLive,
)

const testLayer = Layer.merge(
  pipelineDependencies,
  EditingPipelineLive.pipe(Layer.provide(pipelineDependencies)),
)

const makeProjectRoot = (): Promise<string> =>
  mkdtemp(path.join(os.tmpdir(), "owl-editor-pipeline-"))

describe("EditingPipeline rollback retention", () => {
  it("returns preview diffs without writing when autoApprove is false", async () => {
    const projectRoot = await makeProjectRoot()
    const relativeFile = "src/example.ts"
    const absoluteFile = path.join(projectRoot, relativeFile)

    try {
      await mkdir(path.dirname(absoluteFile), { recursive: true })
      const originalContent = `const unchanged0 = 0
const unchanged1 = 1
const unchanged2 = 2
const unchanged3 = 3
const unchanged4 = 4
const unchanged5 = 5
const unchanged6 = 6
const unchanged7 = 7
const unchanged8 = 8
const unchanged9 = 9
const value = 1
const unchanged11 = 11
const unchanged12 = 12
const unchanged13 = 13
const unchanged14 = 14
const unchanged15 = 15
const unchanged16 = 16
const unchanged17 = 17
const unchanged18 = 18
const unchanged19 = 19
`
      await writeFile(absoluteFile, originalContent, "utf8")

      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const pipeline = yield* EditingPipeline
          return yield* pipeline.execute({
            mutationId: "mutation-preview-1",
            targets: [
              {
                file: relativeFile,
                oldString: "const value = 1",
                newString: "const value = 2",
              },
            ],
            projectRoot,
            autoApprove: false,
          })
        }).pipe(Effect.provide(testLayer)),
      )

      expect(result.completedStage).toBe("approval")
      expect(result.approved).toBe(false)
      expect(result.results).toHaveLength(1)
      expect(result.results[0]?.diff.linesAdded).toBe(1)
      expect(await readFile(absoluteFile, "utf8")).toBe(originalContent)
    } finally {
      await rm(projectRoot, { recursive: true, force: true })
    }
  })

  it("keeps rollback entries after successful mutations so /undo can restore", async () => {
    const projectRoot = await makeProjectRoot()
    const relativeFile = "src/example.ts"
    const absoluteFile = path.join(projectRoot, relativeFile)

    try {
      await mkdir(path.dirname(absoluteFile), { recursive: true })
      const restoredContent = `const unchanged0 = 0
const unchanged1 = 1
const unchanged2 = 2
const unchanged3 = 3
const unchanged4 = 4
const unchanged5 = 5
const unchanged6 = 6
const unchanged7 = 7
const unchanged8 = 8
const unchanged9 = 9
const value = 1
const unchanged11 = 11
const unchanged12 = 12
const unchanged13 = 13
const unchanged14 = 14
const unchanged15 = 15
const unchanged16 = 16
const unchanged17 = 17
const unchanged18 = 18
const unchanged19 = 19
`
      await writeFile(absoluteFile, restoredContent, "utf8")

      const restoredFiles = await Effect.runPromise(
        Effect.gen(function* () {
          const pipeline = yield* EditingPipeline
          const rollback = yield* RollbackSystem

          const result = yield* pipeline.execute({
            mutationId: "mutation-undo-1",
            targets: [
              {
                file: relativeFile,
                oldString: "const value = 1",
                newString: "const value = 2",
              },
            ],
            projectRoot,
            autoApprove: true,
          })

          expect(result.completedStage).toBe("verification")
          expect(result.results).toHaveLength(1)

          const entries = yield* rollback.getEntries("mutation-undo-1")
          expect(entries).toHaveLength(1)
          expect(entries[0]?.file).toBe(relativeFile)

          return yield* rollback.rollback("mutation-undo-1", projectRoot)
        }).pipe(Effect.provide(testLayer)),
      )

      expect(restoredFiles).toEqual([relativeFile])
      expect(await readFile(absoluteFile, "utf8")).toBe(restoredContent)
    } finally {
      await rm(projectRoot, { recursive: true, force: true })
    }
  })
})
