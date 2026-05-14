/**
 * @Owl.FMCF.Registry - Hash Registry reader for the /hashes/ brain
 *
 * The /hashes/ directory is the Single Source of Truth (Track 2) that mirrors
 * the source code structure (Track 1). This module provides read access to that brain.
 *
 * The 1:1 Mirroring Rule: Every source file in /src/ has a corresponding entry in /hashes/.
 * Example: src/components/payment/ → hashes/src/components/payment/
 *
 * Registry contents include:
 * - Grammar Shards: Vocabulary definitions from LANGUAGE.md
 * - Contracts: Module interface contracts (.contract.json)
 * - Logic blueprints: Operational logic (.logic.md)
 * - Atlas: Module dependency and depth atlas
 * - Chronos: Timestamps for all state changes
 * - seams.json: All seam definitions with capacity and classification
 * - subsystems.json: All subsystem definitions with invariants
 *
 * @example
 * // Check if a source file has a registry mirror
 * const hasMirror = yield* Effect.flatMap(HashRegistry, (r) =>
 *   r.hasMirror("src/components/payment/index.ts")
 * )
 *
 * // Read all seams for analysis
 * const seams = yield* Effect.flatMap(HashRegistry, (r) => r.readSeams())
 */
import { Context, Effect, Layer } from "effect"
import { FileSystem } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"
import { HashRegistryError } from "../../core/errors/index.js"
import path from "node:path"

/**
 * @Owl.FMCF.Registry.Subsystem - Subsystem entry from registry
 *
 * Represents a bounded context in the Domain Constituting section of FMCF.
 * Subsystems have invariants that govern what they MUST NOT import from where.
 *
 * @example
 * {
 *   id: "subsystem-engine",
 *   name: "Orchestration Engine",
 *   modules: ["orchestrator", "context", "memory"],
 *   invariants: ["MUST NOT: import from other src/ subsystem"]
 * }
 */
export interface SubsystemEntry {
  readonly id: string
  readonly name: string
  readonly modules: readonly string[]
  readonly invariants: readonly string[]
}

/**
 * @Owl.FMCF.Registry.Seam - Seam entry from registry
 *
 * A seam is a boundary between modules where changes can be made independently.
 * Seams have capacity (BACKBONE/CRITICAL/EXPLORATORY/INTERNAL) that guides
 * deepening investment decisions.
 *
 * @example
 * {
 *   id: "seam-orchestrator-router",
 *   name: "Orchestrator-Router Crossing Point",
 *   module: "providers/router",
 *   capacity: "BACKBONE"
 * }
 */
export interface SeamEntry {
  readonly id: string
  readonly name: string
  readonly module: string
  readonly capacity: string
}

/**
 * @Owl.FMCF.Registry.Service - Hash Registry reader interface
 *
 * Provides read-only access to the FMCF brain. All operations are Effect-based
 * for proper error handling and composition.
 */
export interface HashRegistryService {
  /**
   * Read all subsystem entries from subsystems.json
   * @returns Array of SubsystemEntry with invariants and module lists
   */
  readonly readSubsystems: () => Effect.Effect<
    readonly SubsystemEntry[],
    HashRegistryError
  >
  /**
   * Read all seam entries from seams.json
   * @returns Array of SeamEntry with capacity classifications
   */
  readonly readSeams: () => Effect.Effect<
    readonly SeamEntry[],
    HashRegistryError
  >
  /**
   * Check if a source file has a corresponding hash mirror
   * @param srcRelativePath - Path relative to src/, e.g., "components/payment/index.ts"
   * @returns true if hashes/src/components/payment/index.hash.md exists
   */
  readonly hasMirror: (
    srcRelativePath: string,
  ) => Effect.Effect<boolean, HashRegistryError>
}

/** @Owl.FMCF.Registry.Tag - Service tag for hash registry */
export class HashRegistry extends Context.Tag("HashRegistry")<
  HashRegistry,
  HashRegistryService
>() {}

/** @Owl.FMCF.Registry.Reader - JSON file reader with error handling */
const readJson = <T>(
  fs: FileSystem.FileSystem,
  filePath: string,
): Effect.Effect<T, HashRegistryError> =>
  fs.readFileString(filePath).pipe(
    Effect.mapError(
      (e) =>
        new HashRegistryError({
          path: filePath,
          reason: String(e),
        }),
    ),
    Effect.flatMap((raw) =>
      Effect.try({
        try: () => JSON.parse(raw) as T,
        catch: (e) =>
          new HashRegistryError({
            path: filePath,
            reason: `JSON parse error: ${String(e)}`,
          }),
      }),
    ),
  )

/**
 * @Owl.FMCF.Registry.Live - File-system-backed registry reader
 *
 * Reads from the /hashes/ directory at the project root. Requires NodeFileSystem.
 * All reads are validated with parse error handling.
 *
 * @param registryRoot - Absolute path to project root (contains /hashes/ directory)
 * @example
 * const layer = HashRegistryLive("/path/to/project")
 * Layer.provide(layer, [HashRegistryLive("/path/to/project")])
 */
export const HashRegistryLive = (registryRoot: string) =>
  Layer.effect(
    HashRegistry,
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem

      const readSubsystems = (): Effect.Effect<
        readonly SubsystemEntry[],
        HashRegistryError
      > => {
        const filePath = path.join(registryRoot, "hashes", "subsystems.json")
        return readJson<{ subsystems: SubsystemEntry[] }>(fs, filePath).pipe(
          Effect.map((data) => data.subsystems),
        )
      }

      const readSeams = (): Effect.Effect<
        readonly SeamEntry[],
        HashRegistryError
      > => {
        const filePath = path.join(registryRoot, "hashes", "seams.json")
        return readJson<{ seams: SeamEntry[] }>(fs, filePath).pipe(
          Effect.map((data) => data.seams),
        )
      }

      const hasMirror = (
        srcRelativePath: string,
      ): Effect.Effect<boolean, HashRegistryError> => {
        const withoutSrc = srcRelativePath.replace(/^src\//, "")
        const hashPath = path.join(
          registryRoot,
          "hashes",
          withoutSrc.replace(/\.ts$/, ".hash.md"),
        )
        return fs.exists(hashPath).pipe(
          Effect.mapError(
            (e) =>
              new HashRegistryError({
                path: hashPath,
                reason: String(e),
              }),
          ),
        )
      }

      return {
        readSubsystems,
        readSeams,
        hasMirror,
      } satisfies HashRegistryService
    }),
  ).pipe(Layer.provide(NodeFileSystem.layer))
