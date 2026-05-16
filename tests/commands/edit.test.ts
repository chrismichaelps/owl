/** @Owl.Tests.Commands.Edit - Editing command mutation ID tests */
import { describe, expect, it } from "vitest"
import { Chunk, Effect, Option } from "effect"
import { makeApplyCommand } from "../../src/commands/editing/apply.js"
import {
  formatEditOutput,
  makeEditCommand,
} from "../../src/commands/editing/edit.js"
import {
  PendingMutationStore,
  PendingMutationStoreLive,
} from "../../src/editor/pending/index.js"
import type { PendingMutationStoreService } from "../../src/editor/pending/index.js"
import type {
  EditingPipelineService,
  PipelineResult,
} from "../../src/editor/pipeline/index.js"

const PIPELINE_RESULT: PipelineResult = {
  mutationId: "edit-example",
  completedStage: "verification",
  approved: true,
  rolledBack: false,
  shardSplitWarnings: [],
  results: [
    {
      file: "src/a.ts",
      oldContent: "const value = 1\n",
      newContent: "const value = 2\n",
      diff: {
        file: "src/a.ts",
        hunks: [
          {
            oldStart: 1,
            oldLines: 1,
            newStart: 1,
            newLines: 1,
            lines: ["-const value = 1", "+const value = 2"],
          },
        ],
        linesAdded: 1,
        linesRemoved: 1,
        totalOldLines: 1,
        changePercent: 0.1,
        isShardSplit: false,
      },
    },
  ],
}

const makePipeline = (): EditingPipelineService => ({
  execute: (input) =>
    Effect.succeed({
      ...PIPELINE_RESULT,
      mutationId: input.mutationId,
    }),
})

const makePending = (): PendingMutationStoreService => ({
  put: (mutationId, targets) =>
    Effect.succeed({
      mutationId,
      targets: Chunk.fromIterable(targets),
      createdAt: "2026-05-16T00:00:00.000Z",
    }),
  get: () => Effect.succeed(Option.none()),
  remove: () => Effect.void,
  list: () => Effect.succeed(Chunk.empty()),
})

describe("makeEditCommand", () => {
  it("returns the deterministic mutation ID for rollback commands", async () => {
    const command = makeEditCommand(makePipeline(), makePending(), "/project")
    const first = await Effect.runPromise(
      command.execute(["src/a.ts", "old", "new"]),
    )
    const second = await Effect.runPromise(
      command.execute(["src/a.ts", "old", "new"]),
    )

    expect(first.output).toContain("mutation edit-")
    expect(first.output).toBe(second.output)
  })

  it("includes a fenced unified diff in the command output", async () => {
    const command = makeEditCommand(makePipeline(), makePending(), "/project")
    const result = await Effect.runPromise(
      command.execute(["src/a.ts", "const value = 1", "const value = 2"]),
    )

    expect(result.output).toContain("```diff")
    expect(result.output).toContain("--- a/src/a.ts")
    expect(result.output).toContain("+const value = 2")
  })

  it("previews and stores a pending mutation when --preview is used", async () => {
    const command = makeEditCommand(makePipeline(), makePending(), "/project")
    const result = await Effect.runPromise(
      command.execute([
        "--preview",
        "src/a.ts",
        "const value = 1",
        "const value = 2",
      ]),
    )

    expect(result.output).toContain("Pending approval")
    expect(result.output).toContain("Run /apply edit-")
  })
})

describe("makeApplyCommand", () => {
  it("applies and removes a pending mutation", async () => {
    const output = await Effect.runPromise(
      Effect.gen(function* () {
        const pending = yield* PendingMutationStore
        const stored = yield* pending.put("edit-example", [
          {
            file: "src/a.ts",
            oldString: "const value = 1",
            newString: "const value = 2",
          },
        ])
        const command = makeApplyCommand(makePipeline(), pending, "/project")
        const result = yield* command.execute([stored.mutationId])
        const removed = yield* pending.get(stored.mutationId)

        expect(Option.isNone(removed)).toBe(true)
        return result.output
      }).pipe(Effect.provide(PendingMutationStoreLive)),
    )

    expect(output).toContain("Applied edit-example")
    expect(output).toContain("Use /undo edit-example")
  })
})

describe("formatEditOutput", () => {
  it("returns a compact message when no changes were applied", () => {
    expect(
      formatEditOutput("src/a.ts", "edit-empty", {
        ...PIPELINE_RESULT,
        results: [],
      }),
    ).toBe("No changes applied")
  })
})
