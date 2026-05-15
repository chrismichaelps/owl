/** @Owl.Tests.Commands.Ids - Deterministic command identifier tests */
import { describe, expect, it } from "vitest"
import {
  makeCommandTaskId,
  makeMutationId,
} from "../../src/commands/utils/ids.js"
import { COMMAND_CONSTANTS } from "../../src/core/constants/index.js"

describe("command identifier utilities", () => {
  it("generates stable task IDs for identical command payloads", () => {
    const a = makeCommandTaskId("task", "same prompt")
    const b = makeCommandTaskId("task", "same prompt")

    expect(a).toBe(b)
    expect(a).toMatch(/^cmd-task-[a-f0-9]+$/)
    expect(a.split("-").at(-1)).toHaveLength(COMMAND_CONSTANTS.ID_HASH_LENGTH)
  })

  it("generates different task IDs for different commands", () => {
    expect(makeCommandTaskId("task", "same prompt")).not.toBe(
      makeCommandTaskId("deep", "same prompt"),
    )
  })

  it("generates stable mutation IDs from the mutation content", () => {
    const a = makeMutationId("edit", "src/a.ts", ["old", "new"])
    const b = makeMutationId("edit", "src/a.ts", ["old", "new"])

    expect(a).toBe(b)
    expect(a).toMatch(/^edit-[a-f0-9]+$/)
  })
})
