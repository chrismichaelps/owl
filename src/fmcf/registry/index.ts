/** @Owl.FMCF.Registry - Hash Registry reader for the /hashes/ brain */
import { Context, Effect, Layer } from "effect"
import { FileSystem } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"
import { HashRegistryError } from "../../core/errors/index.js"
import path from "node:path"

/** @Owl.FMCF.Registry.Subsystem - Subsystem entry from registry */
export interface SubsystemEntry {
  readonly id: string
  readonly name: string
  readonly modules: readonly string[]
  readonly invariants: readonly string[]
}

/** @Owl.FMCF.Registry.Seam - Seam entry from registry */
export interface SeamEntry {
  readonly id: string
  readonly name: string
  readonly module: string
  readonly capacity: string
}

/** @Owl.FMCF.Registry.Service - Hash Registry reader interface */
export interface HashRegistryService {
  readonly readSubsystems: () => Effect.Effect<
    readonly SubsystemEntry[],
    HashRegistryError
  >
  readonly readSeams: () => Effect.Effect<
    readonly SeamEntry[],
    HashRegistryError
  >
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

/** @Owl.FMCF.Registry.Live - File-system-backed registry reader */
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
