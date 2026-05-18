/** @Owl.Tests.TUI.PendingShortcuts - Focused pending approval keyboard policy */
import { Chunk, Option } from "effect"
import { describe, expect, it } from "vitest"
import { TUI_FOCUS } from "../../src/core/constants/index.js"
import { resolvePendingApprovalShortcut } from "../../src/tui/pending/shortcuts.js"

const pendingIds = Chunk.make("mut-1", "mut-2")

describe("resolvePendingApprovalShortcut", () => {
  it("resolves apply for the first pending Mutation when Metrics is focused", () => {
    const shortcut = resolvePendingApprovalShortcut(
      "a",
      TUI_FOCUS.METRICS,
      pendingIds,
    )

    expect(Option.isSome(shortcut)).toBe(true)
    if (Option.isSome(shortcut)) {
      expect(shortcut.value).toEqual({
        action: "apply",
        mutationId: "mut-1",
        command: "/apply mut-1",
      })
    }
  })

  it("resolves diff and reject commands deterministically", () => {
    const diff = resolvePendingApprovalShortcut(
      "d",
      TUI_FOCUS.METRICS,
      pendingIds,
    )
    const reject = resolvePendingApprovalShortcut(
      "r",
      TUI_FOCUS.METRICS,
      pendingIds,
    )

    expect(Option.isSome(diff) ? diff.value.command : "").toBe("/diff mut-1")
    expect(Option.isSome(reject) ? reject.value.command : "").toBe(
      "/reject mut-1",
    )
  })

  it("does not resolve outside the Metrics panel", () => {
    const shortcut = resolvePendingApprovalShortcut(
      "a",
      TUI_FOCUS.RESPONSE,
      pendingIds,
    )

    expect(Option.isNone(shortcut)).toBe(true)
  })

  it("does not resolve when no pending Mutations exist", () => {
    const shortcut = resolvePendingApprovalShortcut(
      "a",
      TUI_FOCUS.METRICS,
      Chunk.empty(),
    )

    expect(Option.isNone(shortcut)).toBe(true)
  })

  it("ignores unknown keys", () => {
    const shortcut = resolvePendingApprovalShortcut(
      "x",
      TUI_FOCUS.METRICS,
      pendingIds,
    )

    expect(Option.isNone(shortcut)).toBe(true)
  })
})
