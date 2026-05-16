/** @Owl.Tests.Editor.Pending - Pending Mutation store tests */
import { describe, expect, it } from "vitest"
import { Chunk, Effect, Option } from "effect"
import {
  PendingMutationStore,
  PendingMutationStoreLive,
} from "../../src/editor/pending/index.js"

const run = <A>(effect: Effect.Effect<A, never, PendingMutationStore>) =>
  Effect.runPromise(effect.pipe(Effect.provide(PendingMutationStoreLive)))

describe("PendingMutationStore", () => {
  it("stores and retrieves a pending mutation by id", async () => {
    const found = await run(
      Effect.gen(function* () {
        const store = yield* PendingMutationStore
        yield* store.put("edit-1", [
          { file: "src/a.ts", oldString: "old", newString: "new" },
        ])
        return yield* store.get("edit-1")
      }),
    )

    expect(Option.isSome(found)).toBe(true)
    if (Option.isSome(found)) {
      expect(found.value.mutationId).toBe("edit-1")
      expect(Chunk.size(found.value.targets)).toBe(1)
    }
  })

  it("removes a pending mutation after apply", async () => {
    const found = await run(
      Effect.gen(function* () {
        const store = yield* PendingMutationStore
        yield* store.put("edit-1", [
          { file: "src/a.ts", oldString: "old", newString: "new" },
        ])
        yield* store.remove("edit-1")
        return yield* store.get("edit-1")
      }),
    )

    expect(Option.isNone(found)).toBe(true)
  })

  it("lists pending mutations in creation order", async () => {
    const list = await run(
      Effect.gen(function* () {
        const store = yield* PendingMutationStore
        yield* store.put("edit-1", [
          { file: "src/a.ts", oldString: "old", newString: "new" },
        ])
        yield* store.put("edit-2", [
          { file: "src/b.ts", oldString: "old", newString: "new" },
        ])
        return yield* store.list()
      }),
    )

    expect(Chunk.map(list, (entry) => entry.mutationId)).toEqual(
      Chunk.make("edit-1", "edit-2"),
    )
  })
})
