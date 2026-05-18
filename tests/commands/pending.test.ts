/** @Owl.Tests.Commands.Pending - Pending edit approval command */
import { Chunk, Effect } from "effect"
import { describe, expect, it } from "vitest"
import {
  PendingMutationStore,
  PendingMutationStoreLive,
} from "../../src/editor/pending/index.js"
import {
  formatPendingMutations,
  makePendingCommand,
} from "../../src/commands/editing/pending.js"

const run = <A>(effect: Effect.Effect<A, never, PendingMutationStore>) =>
  Effect.runPromise(effect.pipe(Effect.provide(PendingMutationStoreLive)))

describe("formatPendingMutations", () => {
  it("renders an empty approval inbox", () => {
    expect(formatPendingMutations(Chunk.empty())).toContain(
      "No pending mutations",
    )
  })

  it("renders command affordances for pending mutations", () => {
    expect(formatPendingMutations(Chunk.make("edit-abc"))).toContain(
      "/apply <mutationId>",
    )
  })
})

describe("makePendingCommand", () => {
  it("lists pending mutations from the approval store", async () => {
    const output = await run(
      Effect.gen(function* () {
        const pending = yield* PendingMutationStore
        yield* pending.put(
          "edit-abc",
          Chunk.make({
            file: "src/example.ts",
            oldString: "old",
            newString: "new",
          }),
        )

        const command = makePendingCommand(pending)
        return yield* command.execute([])
      }),
    )

    expect(output.output).toContain("edit-abc")
    expect(output.output).toContain("src/example.ts")
  })
})
