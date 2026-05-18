/** @Owl.Tests.Commands.Edit - Editing command mutation ID tests */
import { describe, expect, it } from "vitest"
import { Chunk, Effect, Exit, Option } from "effect"
import { makeApplyCommand } from "../../src/commands/editing/apply.js"
import {
  formatEditOutput,
  makeEditCommand,
} from "../../src/commands/editing/edit.js"
import { makeRejectCommand } from "../../src/commands/editing/reject.js"
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
  shardSplitWarnings: Chunk.empty(),
  results: Chunk.make({
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
  }),
}

const PIPELINE_PREVIEW = Chunk.unsafeGet(PIPELINE_RESULT.results, 0)

const makeTarget = (file: string, oldString: string, newString: string) => ({
  file,
  oldString,
  newString,
})

const makePipeline = (): EditingPipelineService => ({
  execute: (input) =>
    Effect.succeed({
      ...PIPELINE_RESULT,
      mutationId: input.mutationId,
      results: Chunk.map(input.targets, (target) => ({
        file: target.file,
        oldContent: target.oldString + "\n",
        newContent: target.newString + "\n",
        diff: {
          file: target.file,
          hunks: [
            {
              oldStart: 1,
              oldLines: 1,
              newStart: 1,
              newLines: 1,
              lines: ["-" + target.oldString, "+" + target.newString],
            },
          ],
          linesAdded: 1,
          linesRemoved: 1,
          totalOldLines: 1,
          changePercent: 0.1,
          isShardSplit: false,
        },
      })),
    }),
})

const makePending = (): PendingMutationStoreService => ({
  put: (mutationId, targets, previews = Chunk.empty()) =>
    Effect.succeed({
      mutationId,
      targets,
      previews,
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

    expect(result.output).toContain("Impact overlay")
    expect(result.output).toContain("medium · +1/-1 · 10.0% changed")
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
  it("lists pending mutations when no mutation ID is provided", async () => {
    const output = await Effect.runPromise(
      Effect.gen(function* () {
        const pending = yield* PendingMutationStore
        yield* pending.put(
          "edit-example",
          Chunk.make(
            makeTarget("src/a.ts", "const value = 1", "const value = 2"),
          ),
          Chunk.make(PIPELINE_PREVIEW),
        )
        const command = makeApplyCommand(makePipeline(), pending, "/project")
        const result = yield* command.execute([])
        return result.output
      }).pipe(Effect.provide(PendingMutationStoreLive)),
    )

    expect(output).toContain("Pending mutations:")
    expect(output).toContain("edit-example")
    expect(output).toContain("medium · +1/-1 · max 10.0%")
    expect(output).toContain("Run /apply <mutationId> or /apply --all")
  })

  it("applies and removes a pending mutation", async () => {
    const output = await Effect.runPromise(
      Effect.gen(function* () {
        const pending = yield* PendingMutationStore
        const stored = yield* pending.put(
          "edit-example",
          Chunk.make(
            makeTarget("src/a.ts", "const value = 1", "const value = 2"),
          ),
        )
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

  it("applies every pending mutation with --all", async () => {
    const output = await Effect.runPromise(
      Effect.gen(function* () {
        const pending = yield* PendingMutationStore
        yield* pending.put(
          "edit-one",
          Chunk.make(
            makeTarget("src/a.ts", "const value = 1", "const value = 2"),
          ),
        )
        yield* pending.put(
          "edit-two",
          Chunk.make(
            makeTarget("src/b.ts", "const value = 1", "const value = 2"),
          ),
        )
        const command = makeApplyCommand(makePipeline(), pending, "/project")
        const result = yield* command.execute(["--all"])
        const first = yield* pending.get("edit-one")
        const second = yield* pending.get("edit-two")
        expect(Option.isNone(first)).toBe(true)
        expect(Option.isNone(second)).toBe(true)
        return result.output
      }).pipe(Effect.provide(PendingMutationStoreLive)),
    )

    expect(output).toContain("Applied pending mutations:")
    expect(output).toContain("edit-one")
    expect(output).toContain("edit-two")
  })

  it("applies selected files and keeps the rest pending", async () => {
    const output = await Effect.runPromise(
      Effect.gen(function* () {
        const pending = yield* PendingMutationStore
        yield* pending.put(
          "edit-multi",
          Chunk.make(
            makeTarget("src/a.ts", "const a = 1", "const a = 2"),
            makeTarget("src/b.ts", "const b = 1", "const b = 2"),
          ),
        )
        const command = makeApplyCommand(makePipeline(), pending, "/project")
        const result = yield* command.execute(["edit-multi", "src/a.ts"])
        const remaining = yield* pending.get("edit-multi")

        expect(Option.isSome(remaining)).toBe(true)
        if (Option.isSome(remaining)) {
          expect(Chunk.toReadonlyArray(remaining.value.targets)).toEqual([
            {
              file: "src/b.ts",
              oldString: "const b = 1",
              newString: "const b = 2",
            },
          ])
        }
        return result.output
      }).pipe(Effect.provide(PendingMutationStoreLive)),
    )

    expect(output).toContain("Applied edit-multi")
    expect(output).toContain("src/a.ts")
    expect(output).toContain("remaining: src/b.ts")
  })

  it("rejects selected files that are not part of the pending mutation", async () => {
    const exit = await Effect.runPromiseExit(
      Effect.gen(function* () {
        const pending = yield* PendingMutationStore
        yield* pending.put(
          "edit-multi",
          Chunk.make(makeTarget("src/a.ts", "const a = 1", "const a = 2")),
        )
        const command = makeApplyCommand(makePipeline(), pending, "/project")
        return yield* command.execute(["edit-multi", "src/missing.ts"])
      }).pipe(Effect.provide(PendingMutationStoreLive)),
    )

    expect(Exit.isFailure(exit)).toBe(true)
  })
})

describe("makeRejectCommand", () => {
  it("lists pending mutations when no mutation ID is provided", async () => {
    const output = await Effect.runPromise(
      Effect.gen(function* () {
        const pending = yield* PendingMutationStore
        yield* pending.put(
          "edit-example",
          Chunk.make(
            makeTarget("src/a.ts", "const value = 1", "const value = 2"),
          ),
          Chunk.make(PIPELINE_PREVIEW),
        )
        const command = makeRejectCommand(pending)
        const result = yield* command.execute([])
        return result.output
      }).pipe(Effect.provide(PendingMutationStoreLive)),
    )

    expect(output).toContain("Pending mutations:")
    expect(output).toContain("edit-example")
    expect(output).toContain("medium · +1/-1 · max 10.0%")
    expect(output).toContain("Run /reject <mutationId>")
  })

  it("rejects and removes a whole pending mutation", async () => {
    const output = await Effect.runPromise(
      Effect.gen(function* () {
        const pending = yield* PendingMutationStore
        yield* pending.put(
          "edit-example",
          Chunk.make(
            makeTarget("src/a.ts", "const value = 1", "const value = 2"),
          ),
        )
        const command = makeRejectCommand(pending)
        const result = yield* command.execute(["edit-example"])
        const rejected = yield* pending.get("edit-example")
        expect(Option.isNone(rejected)).toBe(true)
        return result.output
      }).pipe(Effect.provide(PendingMutationStoreLive)),
    )

    expect(output).toContain("Rejected edit-example")
    expect(output).toContain("src/a.ts")
  })

  it("rejects selected files and keeps the rest pending", async () => {
    const output = await Effect.runPromise(
      Effect.gen(function* () {
        const pending = yield* PendingMutationStore
        yield* pending.put(
          "edit-multi",
          Chunk.make(
            makeTarget("src/a.ts", "const a = 1", "const a = 2"),
            makeTarget("src/b.ts", "const b = 1", "const b = 2"),
          ),
        )
        const command = makeRejectCommand(pending)
        const result = yield* command.execute(["edit-multi", "src/a.ts"])
        const remaining = yield* pending.get("edit-multi")

        expect(Option.isSome(remaining)).toBe(true)
        if (Option.isSome(remaining)) {
          expect(Chunk.toReadonlyArray(remaining.value.targets)).toEqual([
            {
              file: "src/b.ts",
              oldString: "const b = 1",
              newString: "const b = 2",
            },
          ])
        }
        return result.output
      }).pipe(Effect.provide(PendingMutationStoreLive)),
    )

    expect(output).toContain("Rejected edit-multi")
    expect(output).toContain("src/a.ts")
    expect(output).toContain("Remaining pending files: src/b.ts")
  })

  it("rejects every pending mutation with --all", async () => {
    const output = await Effect.runPromise(
      Effect.gen(function* () {
        const pending = yield* PendingMutationStore
        yield* pending.put(
          "edit-one",
          Chunk.make(
            makeTarget("src/a.ts", "const value = 1", "const value = 2"),
          ),
        )
        yield* pending.put(
          "edit-two",
          Chunk.make(
            makeTarget("src/b.ts", "const value = 1", "const value = 2"),
          ),
        )
        const command = makeRejectCommand(pending)
        const result = yield* command.execute(["--all"])
        const first = yield* pending.get("edit-one")
        const second = yield* pending.get("edit-two")
        expect(Option.isNone(first)).toBe(true)
        expect(Option.isNone(second)).toBe(true)
        return result.output
      }).pipe(Effect.provide(PendingMutationStoreLive)),
    )

    expect(output).toContain("Rejected pending mutations:")
    expect(output).toContain("edit-one")
    expect(output).toContain("edit-two")
  })
})

describe("formatEditOutput", () => {
  it("returns a compact message when no changes were applied", () => {
    expect(
      formatEditOutput("src/a.ts", "edit-empty", {
        ...PIPELINE_RESULT,
        results: Chunk.empty(),
      }),
    ).toBe("No changes applied")
  })
})
