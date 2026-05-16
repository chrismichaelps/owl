/** @Owl.Tests.Commands.Edit - Editing command mutation ID tests */
import { describe, expect, it } from "vitest"
import { Effect } from "effect"
import {
  formatEditOutput,
  makeEditCommand,
} from "../../src/commands/editing/edit.js"
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

describe("makeEditCommand", () => {
  it("returns the deterministic mutation ID for rollback commands", async () => {
    const command = makeEditCommand(makePipeline(), "/project")
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
    const command = makeEditCommand(makePipeline(), "/project")
    const result = await Effect.runPromise(
      command.execute(["src/a.ts", "const value = 1", "const value = 2"]),
    )

    expect(result.output).toContain("```diff")
    expect(result.output).toContain("--- a/src/a.ts")
    expect(result.output).toContain("+const value = 2")
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
