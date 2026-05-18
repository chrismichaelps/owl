/**
 * @Owl.Tests.CLI.Args
 * Tests for the pure parseArgs() function.
 * Zero I/O — passes synthetic argv arrays directly.
 */
import { describe, it, expect } from "vitest"
import {
  isValidMode,
  isValidProvider,
  parsePrivacyMode,
  parseArgs,
  VALID_MODES,
} from "../../src/cli/args.js"
import { TOOL_PERMISSION_MODES } from "../../src/core/constants/index.js"
import { Option } from "effect"

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

describe("isValidProvider", () => {
  it("validates provider membership", () => {
    expect(isValidProvider("anthropic")).toBe(true)
    expect(isValidProvider("invalid")).toBe(false)
  })
})

describe("parsePrivacyMode", () => {
  it("parses enabled values", () => {
    expect(Option.getOrThrow(parsePrivacyMode("on"))).toBe(true)
    expect(Option.getOrThrow(parsePrivacyMode("true"))).toBe(true)
  })

  it("parses disabled values", () => {
    expect(Option.getOrThrow(parsePrivacyMode("off"))).toBe(false)
    expect(Option.getOrThrow(parsePrivacyMode("false"))).toBe(false)
  })

  it("rejects unknown values", () => {
    expect(Option.isNone(parsePrivacyMode("maybe"))).toBe(true)
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

  it("defaults privacy mode to false", () => {
    expect(parseArgs([]).privacyMode).toBe(false)
  })

  it("defaults resume Session id to null", () => {
    expect(parseArgs([]).resumeSessionId).toBeNull()
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

  it("parses separated mode values", () => {
    expect(parseArgs(["--mode", "deep"]).mode).toBe("deep")
  })

  it("does not treat a separated mode value as the prompt", () => {
    const parsed = parseArgs(["--mode", "quick", "actual prompt"])
    expect(parsed.mode).toBe("quick")
    expect(parsed.prompt).toBe("actual prompt")
  })

  it("leaves unknown separated mode values available as prompt text", () => {
    const parsed = parseArgs(["--mode", "invalid"])
    expect(parsed.mode).toBe("standard")
    expect(parsed.prompt).toBe("invalid")
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

  it("parses separated Permission mode values", () => {
    expect(parseArgs(["--permission-mode", "dontAsk"]).permissionMode).toBe(
      TOOL_PERMISSION_MODES.DONT_ASK,
    )
  })

  it("does not treat a separated Permission mode value as the prompt", () => {
    const parsed = parseArgs(["--permission-mode", "plan", "actual prompt"])
    expect(parsed.permissionMode).toBe(TOOL_PERMISSION_MODES.PLAN)
    expect(parsed.prompt).toBe("actual prompt")
  })

  it("leaves unknown separated Permission mode values available as prompt text", () => {
    const parsed = parseArgs(["--permission-mode", "invalid"])
    expect(parsed.permissionMode).toBe(TOOL_PERMISSION_MODES.DEFAULT)
    expect(parsed.prompt).toBe("invalid")
  })

  it("maps the skip-permissions alias to bypassPermissions", () => {
    expect(parseArgs(["--dangerously-skip-permissions"]).permissionMode).toBe(
      TOOL_PERMISSION_MODES.BYPASS_PERMISSIONS,
    )
  })

  it("does not treat the skip-permissions alias as a prompt", () => {
    const parsed = parseArgs([
      "--dangerously-skip-permissions",
      "actual prompt",
    ])
    expect(parsed.permissionMode).toBe(TOOL_PERMISSION_MODES.BYPASS_PERMISSIONS)
    expect(parsed.prompt).toBe("actual prompt")
  })
})

describe("--model flag", () => {
  it("defaults providerOverride to null", () => {
    expect(parseArgs([]).providerOverride).toBeNull()
  })

  it("parses provider override with equals syntax", () => {
    expect(parseArgs(["--model=anthropic"]).providerOverride).toBe("anthropic")
  })

  it("parses separated provider override values", () => {
    expect(parseArgs(["--model", "ollama"]).providerOverride).toBe("ollama")
  })

  it("does not treat separated provider values as the prompt", () => {
    const parsed = parseArgs(["--model", "openai", "actual prompt"])
    expect(parsed.providerOverride).toBe("openai")
    expect(parsed.prompt).toBe("actual prompt")
  })

  it("leaves unknown separated provider values available as prompt text", () => {
    const parsed = parseArgs(["--model", "invalid"])
    expect(parsed.providerOverride).toBeNull()
    expect(parsed.prompt).toBe("invalid")
  })

  it("ignores unknown provider values with equals syntax", () => {
    const parsed = parseArgs(["--model=invalid"])
    expect(parsed.providerOverride).toBeNull()
    expect(parsed.prompt).toBeNull()
  })
})

describe("--privacy flag", () => {
  it("enables startup privacy mode", () => {
    expect(parseArgs(["--privacy"]).privacyMode).toBe(true)
  })

  it("parses privacy mode with equals syntax", () => {
    expect(parseArgs(["--privacy-mode=on"]).privacyMode).toBe(true)
    expect(parseArgs(["--privacy-mode=off"]).privacyMode).toBe(false)
  })

  it("parses separated privacy mode values", () => {
    expect(parseArgs(["--privacy-mode", "true"]).privacyMode).toBe(true)
    expect(parseArgs(["--privacy-mode", "false"]).privacyMode).toBe(false)
  })

  it("does not treat separated privacy mode values as the prompt", () => {
    const parsed = parseArgs(["--privacy-mode", "on", "actual prompt"])
    expect(parsed.privacyMode).toBe(true)
    expect(parsed.prompt).toBe("actual prompt")
  })

  it("leaves unknown separated privacy mode values available as prompt text", () => {
    const parsed = parseArgs(["--privacy-mode", "maybe"])
    expect(parsed.privacyMode).toBe(false)
    expect(parsed.prompt).toBe("maybe")
  })
})

describe("--resume flag", () => {
  it("parses resume Session id with equals syntax", () => {
    expect(parseArgs(["--resume=sess-0001"]).resumeSessionId).toBe("sess-0001")
  })

  it("parses separated resume Session id values", () => {
    expect(parseArgs(["--resume", "sess-0002"]).resumeSessionId).toBe(
      "sess-0002",
    )
  })

  it("does not treat separated resume Session id values as the prompt", () => {
    const parsed = parseArgs(["--resume", "sess-0003", "actual prompt"])
    expect(parsed.resumeSessionId).toBe("sess-0003")
    expect(parsed.prompt).toBe("actual prompt")
  })

  it("does not consume the next flag as a resume Session id", () => {
    const parsed = parseArgs(["--resume", "--privacy", "actual prompt"])
    expect(parsed.resumeSessionId).toBeNull()
    expect(parsed.privacyMode).toBe(true)
    expect(parsed.prompt).toBe("actual prompt")
  })

  it("ignores empty resume Session id values with equals syntax", () => {
    expect(parseArgs(["--resume="]).resumeSessionId).toBeNull()
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
      providerOverride: null,
      privacyMode: false,
      resumeSessionId: null,
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
