---
Language: Zod
Version: 4.3.x
Grammar_Lock: "@root/hashes/grammar/zod.hash.md"
---

/** [Project].Grammar.Zod - Linguistic DNA anchor for Zod 4.x */

## [SDK_Discovery_Map]
/** === Entry Points === */
/** @Ref: @root/node_modules/zod/index.d.ts */
/** @Ref: @root/node_modules/zod/v4/index.d.ts */
/** === v4 Classic (default API) === */
/** @Ref: @root/node_modules/zod/v4/classic/index.d.ts */
/** @Ref: @root/node_modules/zod/v4/classic/external.d.ts */
/** @Ref: @root/node_modules/zod/v4/classic/schemas.d.ts */
/** @Ref: @root/node_modules/zod/v4/classic/parse.d.ts */
/** @Ref: @root/node_modules/zod/v4/classic/checks.d.ts */
/** @Ref: @root/node_modules/zod/v4/classic/coerce.d.ts */
/** @Ref: @root/node_modules/zod/v4/classic/compat.d.ts */
/** @Ref: @root/node_modules/zod/v4/classic/errors.d.ts */
/** @Ref: @root/node_modules/zod/v4/classic/from-json-schema.d.ts */
/** @Ref: @root/node_modules/zod/v4/classic/iso.d.ts */
/** === v4 Core (internal engine) === */
/** @Ref: @root/node_modules/zod/v4/core/core.d.ts */
/** @Ref: @root/node_modules/zod/v4/core/schemas.d.ts */
/** @Ref: @root/node_modules/zod/v4/core/api.d.ts */
/** @Ref: @root/node_modules/zod/v4/core/checks.d.ts */
/** @Ref: @root/node_modules/zod/v4/core/errors.d.ts */
/** @Ref: @root/node_modules/zod/v4/core/parse.d.ts */
/** @Ref: @root/node_modules/zod/v4/core/regexes.d.ts */
/** @Ref: @root/node_modules/zod/v4/core/registries.d.ts */
/** @Ref: @root/node_modules/zod/v4/core/standard-schema.d.ts */
/** @Ref: @root/node_modules/zod/v4/core/json-schema.d.ts */
/** @Ref: @root/node_modules/zod/v4/core/json-schema-generator.d.ts */
/** @Ref: @root/node_modules/zod/v4/core/to-json-schema.d.ts */
/** @Ref: @root/node_modules/zod/v4/core/util.d.ts */
/** @Ref: @root/node_modules/zod/v4/core/doc.d.ts */
/** @Ref: @root/node_modules/zod/v4/core/versions.d.ts */
/** === v4 Mini (tree-shakeable alternative) === */
/** @Ref: @root/node_modules/zod/v4/mini/index.d.ts */
/** @Ref: @root/node_modules/zod/v4/mini/schemas.d.ts */
/** @Ref: @root/node_modules/zod/v4/mini/parse.d.ts */
/** @Ref: @root/node_modules/zod/v4/mini/checks.d.ts */
/** @Ref: @root/node_modules/zod/v4/mini/coerce.d.ts */
/** @Ref: @root/node_modules/zod/v4/mini/external.d.ts */
/** @Ref: @root/node_modules/zod/v4/mini/iso.d.ts */
/** === v3 Legacy (backward compat) === */
/** @Ref: @root/node_modules/zod/v3/index.d.ts */
/** @Ref: @root/node_modules/zod/v3/types.d.ts */
/** @Ref: @root/node_modules/zod/v3/ZodError.d.ts */
/** @Ref: @root/node_modules/zod/v3/external.d.ts */
/** @Ref: @root/node_modules/zod/v3/errors.d.ts */
/** @Ref: @root/node_modules/zod/v3/standard-schema.d.ts */
/** @Ref: @root/node_modules/zod/v3/helpers/parseUtil.d.ts */
/** @Ref: @root/node_modules/zod/v3/helpers/enumUtil.d.ts */
/** @Ref: @root/node_modules/zod/v3/helpers/util.d.ts */
/** === Locales (40+ language packs) === */
/** @Ref: @root/node_modules/zod/v4/locales/en.d.ts */
/** @Ref: @root/node_modules/zod/locales/index.d.ts */
/** @Ref: @root/node_modules/zod/v4-mini/index.d.ts */
/** @Ref: @root/node_modules/zod/mini/index.d.ts */

## [SDK_Imports / Namespaces]
```ts
// v4 Classic (default)
import { z } from "zod"
import type { ZodType, ZodObject, ZodString, ZodNumber, ZodBoolean, ZodArray, ZodEnum,
  ZodUnion, ZodDiscriminatedUnion, ZodIntersection, ZodTuple, ZodRecord, ZodMap,
  ZodSet, ZodLazy, ZodOptional, ZodNullable, ZodDefault, ZodPipeline, ZodEffects,
  ZodNativeEnum, ZodLiteral, ZodBranded, ZodCatch, ZodReadonly, ZodTemplateLiteral,
  infer as ZodInfer } from "zod"
import type { ZodError, ZodIssue, ZodIssueCode, ZodFormattedError } from "zod"

// v4 Mini (tree-shakeable, for bundles)
import { z } from "zod/v4-mini"

// v3 compat (deprecated but functional)
import { z } from "zod/v3"
```

## [Core_Primitives]
```ts
// Primitive schema factories (v4/classic/schemas.d.ts — 740+ lines)
z.string()      z.number()      z.bigint()     z.boolean()
z.date()        z.symbol()      z.undefined()  z.null()
z.void()        z.any()         z.unknown()    z.never()
z.nan()         z.literal(value)

// Standalone string format schemas (v4 — first-class, not chained)
z.email()       z.url()         z.uuid()       z.guid()
z.jwt()         z.emoji()       z.nanoid()     z.cuid()       z.cuid2()
z.ulid()        z.xid()         z.ksuid()      z.base64()     z.base64url()
z.ipv4()        z.ipv6()        z.mac()        z.cidrv4()     z.cidrv6()
z.e164()        z.hostname()    z.hex()        z.httpUrl()
z.hash("sha256")                               // Hash format validator
z.stringFormat("custom", fn | /regex/)         // Custom string format

// Number format schemas (v4)
z.int()         z.float32()     z.float64()    z.int32()      z.uint32()

// BigInt format schemas (v4)
z.int64()       z.uint64()

// ISO temporal schemas (v4)
z.iso.datetime()   z.iso.date()   z.iso.time()   z.iso.duration()

// Composite schema types
z.object({ key: z.string() })         // ZodObject — strip mode default
z.strictObject({ key: z.string() })   // ZodObject — strict mode (rejects unknown keys)
z.looseObject({ key: z.string() })    // ZodObject — loose mode (passes unknown keys through)
z.array(z.string())                    // ZodArray
z.tuple([z.string(), z.number()])      // ZodTuple
z.union([z.string(), z.number()])      // ZodUnion
z.xor([schemaA, schemaB])              // ZodXor — exclusive union (exactly one must match)
z.discriminatedUnion("type", [...])    // ZodDiscriminatedUnion
z.intersection(schemaA, schemaB)       // ZodIntersection
z.record(z.string(), z.number())       // ZodRecord
z.partialRecord(z.string(), z.number())// ZodRecord — values may be undefined
z.looseRecord(z.string(), z.number()) // ZodRecord — loose mode
z.map(z.string(), z.number())          // ZodMap
z.set(z.string())                      // ZodSet
z.enum(["A", "B", "C"])               // ZodEnum
z.enum(TsEnum)                         // v4: merged nativeEnum into enum()
z.promise(z.string())                  // ZodPromise
z.function({ input: [z.string()], output: z.number() })  // ZodFunction (v4 API)
z.lazy(() => schema)                   // ZodLazy (recursive)
z.templateLiteral([z.literal("prefix-"), z.string()]) // ZodTemplateLiteral
z.file()                               // ZodFile — File/Blob validation with .min() .max() .mime()
z.json()                               // ZodJSONSchema — recursive JSON type validator
z.custom<T>(fn)                        // ZodCustom — custom schema type
z.preprocess(fn, schema)               // ZodPipe<ZodTransform, schema>
z.stringbool()                         // ZodCodec — coerce "true"/"false" strings to boolean

// Bidirectional codec (v4) — encode/decode with separate schemas
z.codec(inputSchema, outputSchema, { decode: fn, encode: fn })  // ZodCodec

// Type inference (THE core pattern)
type User = z.infer<typeof UserSchema>
type UserInput = z.input<typeof UserSchema>   // before transforms
type UserOutput = z.output<typeof UserSchema>  // after transforms

// String checks (chainable on z.string())
.min(1).max(255).length(10).nonempty().regex(/pattern/)
.trim().toLowerCase().toUpperCase().normalize().slugify()
.startsWith("prefix").endsWith("suffix").includes("substr")
.lowercase().uppercase()   // validation checks (don't transform)

// Number checks (chainable)
.min(0).max(100).gt(0).lt(100).gte(0).lte(100)
.int().positive().negative().nonnegative().nonpositive().multipleOf(5)

// BigInt checks (chainable)
.min(0n).max(100n).gt(0n).lt(100n).positive().negative().multipleOf(2n)

// Collection checks (chainable on array, set, map)
.min(1).max(10).nonempty().length(5)   // Array
.min(1).max(10).nonempty().size(5)     // Set, Map

// File checks (chainable on z.file())
.min(1024).max(5_000_000).mime(["image/png", "image/jpeg"])

// Coercion (v4/classic/coerce.d.ts)
z.coerce.string()   z.coerce.number()   z.coerce.boolean()
z.coerce.bigint()   z.coerce.date()

// Standalone check factories (v4 — composable with .check())
z.lt(value)    z.lte(value)    z.gt(value)     z.gte(value)
z.positive()   z.negative()    z.nonpositive() z.nonnegative()
z.multipleOf(n)  z.minLength(n)  z.maxLength(n)  z.length(n)
z.minSize(n)   z.maxSize(n)    z.size(n)
z.regex(/pattern/)  z.includes(str)  z.startsWith(str)  z.endsWith(str)
z.lowercase()  z.uppercase()   z.trim()  z.normalize()  z.slugify()
z.overwrite(fn)  z.mime(types)  z.property(key, schema)
```

## [Architectural_Laws]
- **Export_Law**: Export schemas as `const` with PascalCase suffix `Schema`. Export inferred types alongside: `type User = z.infer<typeof UserSchema>`.
- **Transformation_Law**: Use `.transform()` for data mapping, `.pipe()` for schema-to-schema composition (ZodPipeline). Use `.refine()` / `.superRefine()` for custom validation with type narrowing.
- **Propagation_Law**: `.safeParse()` returns `{ success, data } | { success, error }` — never throws. `.parse()` throws `ZodError`. Use `ZodError.flatten()` for form-friendly formatting. Use `ZodError.format()` for nested access.

## [Syntax_Rules] | [Naming_Conventions]
- PascalCase + `Schema` suffix: `UserSchema`, `CreatePostSchema`
- PascalCase for inferred types: `type User = z.infer<typeof UserSchema>`
- camelCase: validation functions, parse calls
- Chain checks fluently: `z.string().min(1).email()`
- `z.` prefix: all schema factories

## [Prohibited_Patterns]
- NO manual type definitions when schema exists — use `z.infer<typeof Schema>` always
- NO `.parse()` without try/catch — use `.safeParse()` for safe path
- NO runtime `instanceof` checks on schemas — use `schema.safeParse()` for validation
- NO v3 API in new code — use v4 classic or v4-mini
- NO `z.any()` in production schemas — use `z.unknown()` and narrow

## [Deprecated_Definitions]
```ts
// v3 API — still functional via "zod/v3" import but superseded by v4
// v3 ZodError structure differs from v4
// v3 .describe() — replaced by v4 registries & doc system
// v3 helper utilities in zod/v3/helpers/ — internals, do not import directly
```

## [Standard_Library_Signatures]
```ts
// Parsing (v4/classic/parse.d.ts)
schema.parse(data: unknown): T                          // throws ZodError
schema.safeParse(data: unknown): SafeParseResult<T>     // never throws
schema.parseAsync(data: unknown): Promise<T>
schema.safeParseAsync(data: unknown): Promise<SafeParseResult<T>>
schema.spa(data: unknown): Promise<SafeParseResult<T>>  // alias for safeParseAsync

// Bidirectional parsing (v4 — for codecs and transforms)
schema.encode(data: Output): Input       // reverse transform (output → input)
schema.decode(data: Input): Output       // forward transform (input → output)
schema.encodeAsync(data: Output): Promise<Input>
schema.decodeAsync(data: Input): Promise<Output>
schema.safeEncode(data: Output): SafeParseResult<Input>
schema.safeDecode(data: Input): SafeParseResult<Output>

// Modifiers
schema.optional(): ZodOptional<T>          // T | undefined
schema.exactOptional(): ZodExactOptional<T>// key may be missing, but not undefined
schema.nonoptional(): ZodNonOptional<T>    // inverse of optional
schema.nullable(): ZodNullable<T>          // T | null
schema.nullish(): ZodOptional<ZodNullable<T>>  // T | null | undefined
schema.default(value): ZodDefault<T>       // provide default for undefined
schema.prefault(value): ZodPrefault<T>     // provide default for INPUT before parsing
schema.catch(value): ZodCatch<T>           // fallback on error
schema.readonly(): ZodReadonly<T>
schema.brand<B>(): ZodBranded<T, B>        // nominal typing
schema.pipe(otherSchema): ZodPipe          // chain schemas
schema.or(otherSchema): ZodUnion           // shorthand union
schema.and(otherSchema): ZodIntersection   // shorthand intersection
schema.array(): ZodArray<T>                // shorthand array
schema.transform(fn): ZodPipe              // value transformation
schema.check(...checks): this              // add checks (composable)
schema.with(...checks): this               // alias for .check()
schema.clone(): this                       // clone schema instance
schema.apply(fn): T                        // apply function to schema, return result
schema.describe(description): this         // register description in globalRegistry
schema.meta(): GlobalMeta | undefined      // get metadata from globalRegistry
schema.meta(data): this                    // set metadata in globalRegistry
schema.register(registry, meta): this      // register in custom registry
schema.unwrap(): T                         // unwrap wrapper types (optional, nullable, default, etc.)

// Object methods
obj.partial()                    // all optional (selective: .partial({ key: true }))
obj.required()                   // all required (selective: .required({ key: true }))
obj.pick({ key: true })          // subset
obj.omit({ key: true })          // exclude
obj.extend(shape)                // add new fields
obj.safeExtend(shape)            // type-safe extend (prevents narrowing errors)
obj.merge(otherObj)              // @deprecated: use .extend(other.shape)
obj.keyof()                      // ZodEnum from keys
obj.strict()                     // reject unrecognized keys
obj.strip()                      // strip unknown keys (default)
obj.loose()                      // pass unknown keys through (replaces .passthrough())
obj.catchall(schema)             // validate unrecognized keys with schema

// Enum methods
enum.extract(["A", "B"])         // subset enum
enum.exclude(["C"])              // exclude values from enum

// Refinements
schema.refine(val => boolean, { message })     // type-narrowing refinement
schema.superRefine((val, ctx) => { ctx.addIssue(...) })  // full control
schema.overwrite(fn)             // in-place value rewrite (no type change)

// JSON Schema (v4/core/to-json-schema.d.ts)
z.toJSONSchema(schema): JSONSchema
z.fromJSONSchema(jsonSchema): ZodType
schema.toJSONSchema(): JSONSchemaPayload  // instance method

// Registries (v4/core/registries.d.ts)
const registry = z.registry<z.ZodType, { description: string }>()
registry.register(schema, metadata)
registry.get(schema)
z.globalRegistry                          // built-in global registry for .describe() / .meta()

// Standard Schema (v4/core/standard-schema.d.ts)
// Zod v4 implements the Standard Schema interface (~standard) for cross-lib interop
```

## [Error_Modeling]
```ts
// ZodError (v4/classic/errors.d.ts, v4/core/errors.d.ts)
class ZodError extends Error {
  issues: ZodIssue[]
  format(): ZodFormattedError
  flatten(): { formErrors: string[]; fieldErrors: Record<string, string[]> }
}

// ZodIssue.code values:
"invalid_type" | "unrecognized_keys" | "invalid_union" | "invalid_union_discriminator" |
"invalid_enum_value" | "invalid_arguments" | "invalid_return_type" | "invalid_date" |
"custom" | "invalid_intersection_types" | "not_multiple_of" | "not_finite" |
"invalid_string" | "too_small" | "too_big" | "invalid_literal"
```