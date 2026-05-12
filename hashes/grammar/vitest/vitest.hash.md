---
Language: Vitest
Version: 4.x
Grammar_Lock: "@root/hashes/grammar/vitest.hash.md"
---

/** [Project].Grammar.Vitest - Linguistic DNA anchor for Vitest 4.x */

## [SDK_Discovery_Map]
/** === Core (29 definition files) === */
/** @Ref: @root/node_modules/vitest/dist/index.d.ts */
/** @Ref: @root/node_modules/vitest/dist/config.d.ts */
/** @Ref: @root/node_modules/vitest/dist/node.d.ts */
/** @Ref: @root/node_modules/vitest/dist/suite.d.ts */
/** @Ref: @root/node_modules/vitest/dist/coverage.d.ts */
/** @Ref: @root/node_modules/vitest/dist/reporters.d.ts */
/** @Ref: @root/node_modules/vitest/dist/runners.d.ts */
/** @Ref: @root/node_modules/vitest/dist/snapshot.d.ts */
/** @Ref: @root/node_modules/vitest/dist/browser.d.ts */
/** @Ref: @root/node_modules/vitest/dist/environments.d.ts */
/** @Ref: @root/node_modules/vitest/dist/mocker.d.ts */
/** @Ref: @root/node_modules/vitest/dist/module-evaluator.d.ts */
/** @Ref: @root/node_modules/vitest/dist/worker.d.ts */
/** === Top-Level Re-Exports === */
/** @Ref: @root/node_modules/vitest/config.d.ts */
/** @Ref: @root/node_modules/vitest/coverage.d.ts */
/** @Ref: @root/node_modules/vitest/node.d.ts */
/** @Ref: @root/node_modules/vitest/suite.d.ts */
/** @Ref: @root/node_modules/vitest/reporters.d.ts */
/** @Ref: @root/node_modules/vitest/runners.d.ts */
/** @Ref: @root/node_modules/vitest/snapshot.d.ts */
/** @Ref: @root/node_modules/vitest/mocker.d.ts */
/** @Ref: @root/node_modules/vitest/worker.d.ts */
/** @Ref: @root/node_modules/vitest/environments.d.ts */
/** === Type Augmentations === */
/** @Ref: @root/node_modules/vitest/globals.d.ts */
/** @Ref: @root/node_modules/vitest/import-meta.d.ts */
/** @Ref: @root/node_modules/vitest/importMeta.d.ts */
/** @Ref: @root/node_modules/vitest/jsdom.d.ts */
/** @Ref: @root/node_modules/vitest/optional-types.d.ts */
/** @Ref: @root/node_modules/vitest/browser/context.d.ts */

## [SDK_Imports / Namespaces]
```ts
// Test API
import { describe, it, test, expect, vi, beforeAll, beforeEach, afterAll, afterEach, suite, bench } from "vitest"
import type { Mock, MockedFunction, MockedObject, SpyInstance, MockInstance, Mocked, ExpectTypeOf, AssertType } from "vitest"

// Config
import { defineConfig, mergeConfig } from "vitest/config"
import type { UserConfig, ProjectConfig, ResolvedConfig } from "vitest/config"
```

## [Core_Primitives]
```ts
// Test blocks (dist/suite.d.ts)
describe(name: string, fn: () => void): void
describe.skip(name: string, fn: () => void): void
describe.only(name: string, fn: () => void): void
describe.todo(name: string): void
describe.concurrent(name: string, fn: () => void): void
describe.sequential(name: string, fn: () => void): void
describe.shuffle(name: string, fn: () => void): void
describe.each<T>(cases: T[])(name: string, fn: (arg: T) => void): void

it(name: string, fn?: TestFunction, timeout?: number): void
it.skip   it.only   it.todo   it.concurrent   it.sequential   it.each   it.fails
test(name: string, fn?: TestFunction, timeout?: number): void  // alias for it

// test/it variants
test.extend<Fixtures>({ fixture: async ({}, use) => { await use(value) } })
test.scoped  // file-scoped test context

// Lifecycle hooks
beforeAll(fn: () => Awaitable<void>, timeout?: number): void
beforeEach(fn: () => Awaitable<void>, timeout?: number): void
afterAll(fn: () => Awaitable<void>, timeout?: number): void
afterEach(fn: () => Awaitable<void>, timeout?: number): void

// Bench
bench(name: string, fn: BenchFunction, options?: BenchOptions): void
bench.skip   bench.only   bench.todo

// Assertions (dist/index.d.ts — Chai + extended)
expect(value).toBe(expected)              // Object.is
expect(value).toEqual(expected)           // deep equality
expect(value).toStrictEqual(expected)     // strict deep (no undefined props)
expect(value).toBeTruthy()                expect(value).toBeFalsy()
expect(value).toBeNull()                  expect(value).toBeUndefined()
expect(value).toBeDefined()               expect(value).toBeNaN()
expect(value).toBeTypeOf(type)            // "string" | "number" | "boolean" etc.
expect(value).toBeInstanceOf(Class)
expect(value).toBeGreaterThan(n)          expect(value).toBeLessThan(n)
expect(value).toBeGreaterThanOrEqual(n)   expect(value).toBeLessThanOrEqual(n)
expect(value).toBeCloseTo(n, digits?)
expect(value).toContain(item)             // array/string contains
expect(value).toContainEqual(item)        // deep equality contains
expect(value).toHaveLength(n)
expect(value).toHaveProperty(key, value?)
expect(value).toMatch(regexp | string)
expect(value).toMatchObject(obj)
expect(value).toMatchSnapshot(hint?)
expect(value).toMatchInlineSnapshot(snapshot?)
expect(value).toThrow(error?)
expect(value).toThrowError(message?)
expect.soft(value)                         // soft assertions (don't stop test)
expect.assertions(n)                       // assert N assertions were called
expect.hasAssertions()                     // assert at least 1

// Mock assertions
expect(fn).toHaveBeenCalled()
expect(fn).toHaveBeenCalledTimes(n)
expect(fn).toHaveBeenCalledWith(...args)
expect(fn).toHaveBeenLastCalledWith(...args)
expect(fn).toHaveBeenNthCalledWith(n, ...args)
expect(fn).toHaveReturned()
expect(fn).toHaveReturnedWith(value)

// Negation
expect(value).not.toBe(unexpected)

// Asymmetric matchers
expect.anything()                          // matches anything except null/undefined
expect.any(Class)                          // instanceof check
expect.stringContaining(str)
expect.stringMatching(regexp)
expect.objectContaining(obj)
expect.arrayContaining(arr)
expect.closeTo(n, digits?)
```

## [Mocking_System]
```ts
// vi namespace (dist/index.d.ts)
vi.fn<T extends (...args) => any>(impl?: T): MockedFunction<T>
vi.spyOn<T>(object: T, method: keyof T): SpyInstance
vi.mock(path: string, factory?: () => Record<string, unknown>): void
vi.unmock(path: string): void
vi.doMock(path: string, factory?: () => Record<string, unknown>): void
vi.doUnmock(path: string): void
vi.importActual<T>(path: string): Promise<T>
vi.importMock<T>(path: string): Promise<Mocked<T>>
vi.resetAllMocks(): void
vi.restoreAllMocks(): void
vi.clearAllMocks(): void

// Mock instance methods
mock.mockReturnValue(value): this
mock.mockReturnValueOnce(value): this
mock.mockResolvedValue(value): this
mock.mockResolvedValueOnce(value): this
mock.mockRejectedValue(value): this
mock.mockRejectedValueOnce(value): this
mock.mockImplementation(fn): this
mock.mockImplementationOnce(fn): this
mock.mockClear(): this
mock.mockReset(): this
mock.mockRestore(): this
mock.mock.calls: any[][]
mock.mock.results: { type: "return" | "throw"; value: any }[]
mock.mock.instances: any[]
mock.mock.contexts: any[]
mock.mock.lastCall: any[]

// Timers
vi.useFakeTimers(config?): void
vi.useRealTimers(): void
vi.advanceTimersByTime(ms: number): void
vi.advanceTimersToNextTimer(): void
vi.runAllTimers(): void
vi.runOnlyPendingTimers(): void
vi.setSystemTime(date: Date | number | string): void
vi.getMockedSystemTime(): Date | null
vi.getRealSystemTime(): number

// Stubbing
vi.stubGlobal(name: string, value: unknown): void
vi.unstubAllGlobals(): void
vi.stubEnv(name: string, value: string): void
vi.unstubAllEnvs(): void

// Hoisting (v2+)
vi.hoisted<T>(() => T): T  // hoisted to top of file, runs before vi.mock()

// Async wait utilities (v1+)
vi.waitFor<T>(callback: () => T | Promise<T>, options?: { timeout?: number; interval?: number }): Promise<T>
vi.waitUntil<T>(callback: () => T | Promise<T>, options?: { timeout?: number; interval?: number }): Promise<T>
```

## [Advanced_Testing]
```ts
// Polling assertions
await expect.poll(async () => await fetchStatus(), { timeout: 5000, interval: 500 }).toBe("ready")

// Test lifecycle events (per-test hooks)
onTestFailed((result) => { /* runs when current test fails */ })
onTestFinished((result) => { /* runs when current test completes (pass or fail) */ })

// Test artifacts (v4+)
recordArtifact("screenshot", { type: "file", path: "/path/to/file.png" })

// Type-level testing (via expect-type)
import { expectTypeOf } from "vitest"
expectTypeOf<string>().toEqualTypeOf<string>()
expectTypeOf(fn).parameter(0).toBeString()
expectTypeOf(fn).returns.toBeVoid()
expectTypeOf<{ a: string }>().toMatchTypeOf<{ a: string; b?: number }>()
expectTypeOf<string>().not.toEqualTypeOf<number>()
```

## [Architectural_Laws]
- **Export_Law**: Test files as `*.test.ts` or `*.spec.ts`. Config as `vitest.config.ts` or inline in `vite.config.ts`.
- **Transformation_Law**: Each test file runs in isolated worker by default. Use `vi.mock()` at module level (hoisted). Use `vi.fn()` for function stubs. Use `vi.spyOn()` for method spies.
- **Propagation_Law**: Use `expect.assertions(n)` for async error testing. Tests fail on unhandled rejections. Use `test.fails` for expected failure tests. Snapshots stored in `__snapshots__/` directory.

## [Standard_Library_Signatures]
```ts
// Config (config.d.ts)
export default defineConfig({
  test: {
    globals?: boolean,           // inject describe/it/expect globally
    environment?: "node" | "jsdom" | "happy-dom" | "edge-runtime",
    include?: string[],          // default: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"]
    exclude?: string[],
    coverage?: { provider: "v8" | "istanbul", reporter: ["text", "json", "html"], include?: string[], exclude?: string[] },
    setupFiles?: string | string[],
    globalSetup?: string | string[],
    testTimeout?: number,        // default: 5000
    hookTimeout?: number,
    teardownTimeout?: number,
    pool?: "threads" | "forks" | "vmThreads" | "vmForks",
    poolOptions?: { threads?: { minThreads?, maxThreads? } },
    retry?: number,
    sequence?: { shuffle?: boolean, concurrent?: boolean },
    typecheck?: { enabled?: boolean, checker?: "tsc" | "vue-tsc", tsconfig?: string },
    benchmark?: { include?: string[], reporters?: string[] },
    alias?: Record<string, string>,
    deps?: { interopDefault?: boolean },
    mockReset?: boolean,
    restoreMocks?: boolean,
    clearMocks?: boolean,
    unstubEnvs?: boolean,
    unstubGlobals?: boolean,
  }
})
```