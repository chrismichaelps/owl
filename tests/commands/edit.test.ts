/** @Owl.Tests.Commands.Edit - Editing command mutation ID tests */
import { describe, expect, it } from "vitest"
import { Effect } from "effect"
import { makeEditCommand } from "../../src/commands/editing/edit.js"
import type {
  EditingPipelineService,
  PipelineResult,
} from "../../src/editor/pipeline/index.js"

const makePipeline = (): EditingPipelineService => ({
  execute: (input) =>
    Effect.succeed({
      mutationId: input.mutationId,
      completedStage: "verification",
      approved: true,
      rolledBack: false,
      shardSplitWarnings: [],
      results: [
        {
          file: input.targets[0]?.file ?? "unknown",
          oldContent: "old",
          newContent: "new",
          diff: {
            file: input.targets[0]?.file ?? "unknown",
            patch: "",
            linesAdded: 1,
            linesRemoved: 1,
            totalOldLines: 1,
            totalNewLines: 1,
            changePercent: 0.1,
            isShardSplit: false,
          },
        },
      ],
    } satisfies PipelineResult),
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
})
