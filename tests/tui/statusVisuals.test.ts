/** @Owl.Tests.TUI.StatusVisuals - Terminal status resolver tests */
import { describe, expect, it } from "vitest"
import {
  resolveExecutionStageLabel,
  resolveRoleColor,
  resolveStatusColor,
  resolveStatusIcon,
} from "../../src/tui/status/visuals.js"

describe("status visual resolvers", () => {
  it("resolves status icons and colors", () => {
    expect(resolveStatusIcon("inferring")).toBe("◈")
    expect(resolveStatusColor("error")).toBe("red")
  })

  it("resolves FMCF role colors", () => {
    expect(resolveRoleColor("Architect")).toBe("blue")
    expect(resolveRoleColor("Forensic Guardian")).toBe("green")
  })

  it("resolves execution stage labels", () => {
    expect(resolveExecutionStageLabel("streaming")).toBe("Streaming")
    expect(resolveExecutionStageLabel("verification")).toBe("Verification")
  })
})
