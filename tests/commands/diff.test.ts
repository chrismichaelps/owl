/** @Owl.Tests.Commands.Diff - Pending and rollback diff command tests */
import { describe, expect, it } from "vitest"
import { Effect } from "effect"
import { makeDiffCommand } from "../../src/commands/editing/diff.js"
import {
  PendingMutationStore,
  PendingMutationStoreLive,
} from "../../src/editor/pending/index.js"
import type { RollbackSystemService } from "../../src/editor/rollback/index.js"
import type { PipelineMutationResult } from "../../src/editor/pipeline/index.js"

const PREVIEW: PipelineMutationResult = {
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
}

const makeRollback = (): RollbackSystemService => ({
  register: () => Effect.void,
  rollback: () => Effect.succeed([]),
  getEntries: () =>
    Effect.succeed([
      {
        mutationId: "edit-written",
        file: "src/a.ts",
        originalContent: "const value = 1\n",
        timestamp: "2026-05-16T00:00:00.000Z",
      },
    ]),
  clear: () => Effect.void,
})

describe("makeDiffCommand", () => {
  it("renders pending preview diffs before a mutation is applied", async () => {
    const output = await Effect.runPromise(
      Effect.gen(function* () {
        const pending = yield* PendingMutationStore
        yield* pending.put(
          "edit-preview",
          [
            {
              file: "src/a.ts",
              oldString: "const value = 1",
              newString: "const value = 2",
            },
          ],
          [PREVIEW],
        )
        const command = makeDiffCommand(makeRollback(), pending)
        const result = yield* command.execute(["edit-preview"])
        return result.output
      }).pipe(Effect.provide(PendingMutationStoreLive)),
    )

    expect(output).toContain("src/a.ts")
    expect(output).toContain("```diff")
    expect(output).toContain("+const value = 2")
  })

  it("renders pending preview diffs side-by-side when requested", async () => {
    const output = await Effect.runPromise(
      Effect.gen(function* () {
        const pending = yield* PendingMutationStore
        yield* pending.put(
          "edit-preview",
          [
            {
              file: "src/a.ts",
              oldString: "const value = 1",
              newString: "const value = 2",
            },
          ],
          [PREVIEW],
        )
        const command = makeDiffCommand(makeRollback(), pending)
        const result = yield* command.execute([
          "edit-preview",
          "--side-by-side",
        ])
        return result.output
      }).pipe(Effect.provide(PendingMutationStoreLive)),
    )

    expect(output).toContain("```text")
    expect(output).toContain("Side-by-side diff: src/a.ts")
    expect(output).toContain("- const value = 1")
    expect(output).toContain("+ const value = 2")
  })

  it("falls back to rollback snapshots after a mutation is written", async () => {
    const output = await Effect.runPromise(
      Effect.gen(function* () {
        const pending = yield* PendingMutationStore
        const command = makeDiffCommand(makeRollback(), pending)
        const result = yield* command.execute(["edit-written"])
        return result.output
      }).pipe(Effect.provide(PendingMutationStoreLive)),
    )

    expect(output).toContain("src/a.ts")
    expect(output).toContain("snapshot at 2026-05-16T00:00:00.000Z")
  })
})
