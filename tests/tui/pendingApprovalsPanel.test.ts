/** @Owl.Tests.TUI.PendingApprovals - Approval queue rendering helpers */
import { Chunk } from "effect"
import { describe, expect, it } from "vitest"
import { formatPendingApprovalFiles } from "../../src/tui/components/PendingApprovalsPanel.js"

describe("formatPendingApprovalFiles", () => {
  it("renders visible pending files", () => {
    expect(formatPendingApprovalFiles(Chunk.make("src/a.ts"))).toBe("src/a.ts")
  })

  it("summarizes hidden pending files", () => {
    expect(
      formatPendingApprovalFiles(
        Chunk.make("src/a.ts", "src/b.ts", "src/c.ts"),
      ),
    ).toBe("src/a.ts, src/b.ts +1 more")
  })
})
