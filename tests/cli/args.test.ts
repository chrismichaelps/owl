/**
 * @Owl.Tests.CLI.Args
 * Tests for the pure parseArgs() function.
 * Zero I/O — passes synthetic argv arrays directly.
 */
import { describe, it, expect } from "vitest"
import { isValidMode, parseArgs, VALID_MODES } from "../../src/cli/args.js"
import { TOOL_PERMISSION_MODES } from "../../src/core/constants/index.js"

describe("VALID_MODES", () => {
  it("includes standard", () => {
    expect(VALID_MODES).toContain("standard")
  })

  it("includes quick", () => {
    expect(VALID_MODES).toContain("quick")
  })

  it("includes deep", () => {
    expect(VALID_MODES).toContain("deep")
  })

  it("includes economy", () => {
    expect(VALID_MODES).toContain("economy")
  })

  it("includes god", () => {
    expect(VALID_MODES).toContain("god")
  })

  it("has exactly 5 entries", () => {
    expect(VALID_MODES).toHaveLength(5)
  })

  it("validates mode membership", () => {
    expect(isValidMode("deep")).toBe(true)
    expect(isValidMode("invalid")).toBe(false)
  })
})

describe("parseArgs with no arguments", () => {
  it("defaults mode to standard", () => {
    const { mode } = parseArgs([])
    expect(mode).toBe("standard")
  })

  it("defaults prompt to null", () => {
    const { prompt } = parseArgs([])
    expect(prompt).toBeNull()
  })

  it("defaults help to false", () => {
    const { help } = parseArgs([])
    expect(help).toBe(false)
  })

  it("defaults version to false", () => {
    const { version } = parseArgs([])
    expect(version).toBe(false)
  })

  it("defaults permission mode to default", () => {
    const { permissionMode } = parseArgs([])
    expect(permissionMode).toBe(TOOL_PERMISSION_MODES.DEFAULT)
  })
})

describe("metadata flags", () => {
  it("--help sets help", () => {
    expect(parseArgs(["--help"]).help).toBe(true)
  })

  it("-h sets help", () => {
    expect(parseArgs(["-h"]).help).toBe(true)
  })

  it("--version sets version", () => {
    expect(parseArgs(["--version"]).version).toBe(true)
  })

  it("-v sets version", () => {
    expect(parseArgs(["-v"]).version).toBe(true)
  })
})

describe("--mode= flag", () => {
  it("parses --mode=deep", () => {
    expect(parseArgs(["--mode=deep"]).mode).toBe("deep")
  })

  it("parses --mode=quick", () => {
    expect(parseArgs(["--mode=quick"]).mode).toBe("quick")
  })

  it("parses --mode=economy", () => {
    expect(parseArgs(["--mode=economy"]).mode).toBe("economy")
  })

  it("parses --mode=god", () => {
    expect(parseArgs(["--mode=god"]).mode).toBe("god")
  })

  it("parses --mode=standard", () => {
    expect(parseArgs(["--mode=standard"]).mode).toBe("standard")
  })

  it("ignores --mode=invalid and falls back to standard", () => {
    expect(parseArgs(["--mode=invalid"]).mode).toBe("standard")
  })

  it("ignores --mode= (empty value) and falls back to standard", () => {
    expect(parseArgs(["--mode="]).mode).toBe("standard")
  })
})

describe("--permission-mode= flag", () => {
  it("parses bypassPermissions", () => {
    expect(
      parseArgs(["--permission-mode=bypassPermissions"]).permissionMode,
    ).toBe(TOOL_PERMISSION_MODES.BYPASS_PERMISSIONS)
  })

  it("parses plan", () => {
    expect(parseArgs(["--permission-mode=plan"]).permissionMode).toBe(
      TOOL_PERMISSION_MODES.PLAN,
    )
  })

  it("ignores unknown Permission modes", () => {
    expect(parseArgs(["--permission-mode=invalid"]).permissionMode).toBe(
      TOOL_PERMISSION_MODES.DEFAULT,
    )
  })
})

describe("short flag aliases", () => {
  it("--quick sets mode to quick", () => {
    expect(parseArgs(["--quick"]).mode).toBe("quick")
  })

  it("-q sets mode to quick", () => {
    expect(parseArgs(["-q"]).mode).toBe("quick")
  })

  it("--deep sets mode to deep", () => {
    expect(parseArgs(["--deep"]).mode).toBe("deep")
  })

  it("-d sets mode to deep", () => {
    expect(parseArgs(["-d"]).mode).toBe("deep")
  })

  it("--economy sets mode to economy", () => {
    expect(parseArgs(["--economy"]).mode).toBe("economy")
  })

  it("-e sets mode to economy", () => {
    expect(parseArgs(["-e"]).mode).toBe("economy")
  })
})

describe("positional prompt argument", () => {
  it("captures a bare string as the prompt", () => {
    const { prompt } = parseArgs(["my task here"])
    expect(prompt).toBe("my task here")
  })

  it("prompt is null when only flags are passed", () => {
    const { prompt } = parseArgs(["--deep"])
    expect(prompt).toBeNull()
  })

  it("captures the first non-flag positional only", () => {
    const { prompt } = parseArgs(["first", "second"])
    expect(prompt).toBe("first")
  })
})

describe("combined mode flag + prompt", () => {
  it("--mode=deep + prompt", () => {
    const { mode, prompt } = parseArgs(["--mode=deep", "analyze the schema"])
    expect(mode).toBe("deep")
    expect(prompt).toBe("analyze the schema")
  })

  it("-q + prompt", () => {
    const { mode, prompt } = parseArgs(["-q", "quick summary"])
    expect(mode).toBe("quick")
    expect(prompt).toBe("quick summary")
  })

  it("prompt + --deep (flag after prompt)", () => {
    const { mode, prompt } = parseArgs(["do the thing", "--deep"])
    expect(mode).toBe("deep")
    expect(prompt).toBe("do the thing")
  })

  it("last flag wins when multiple modes are specified", () => {
    // e.g. --quick --deep → deep wins (processed later)
    const { mode } = parseArgs(["--quick", "--deep"])
    expect(mode).toBe("deep")
  })
})

describe("edge cases", () => {
  it("unknown flags starting with -- are ignored", () => {
    const { mode, prompt } = parseArgs(["--verbose"])
    expect(mode).toBe("standard")
    expect(prompt).toBeNull()
  })

  it("unknown single-char flags are ignored", () => {
    const { mode } = parseArgs(["-z"])
    expect(mode).toBe("standard")
  })

  it("returns a plain object (not a class instance)", () => {
    const result = parseArgs([])
    expect(result).toStrictEqual({
      mode: "standard",
      prompt: null,
      permissionMode: TOOL_PERMISSION_MODES.DEFAULT,
      help: false,
      version: false,
    })
  })

  it("is a pure function — same input always gives same output", () => {
    const a = parseArgs(["--deep", "task"])
    const b = parseArgs(["--deep", "task"])
    expect(a).toStrictEqual(b)
  })

  it("does not mutate the input array", () => {
    const argv = Object.freeze(["--quick", "hello"] as const)
    expect(() => parseArgs(argv)).not.toThrow()
  })
})
