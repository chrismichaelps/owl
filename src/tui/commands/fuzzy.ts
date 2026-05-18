/** @Owl.TUI.Commands.Fuzzy - Deterministic command palette ranking */
import { Chunk, Data, HashSet, Order } from "effect"
import { TUI_PENDING_ARGUMENT_COMMANDS } from "../../core/constants/index.js"

export interface PaletteCommand {
  readonly name: string
  readonly description: string
}

export interface RankedPaletteCommand extends PaletteCommand {
  readonly score: number
}

export interface PaletteInputParts {
  readonly commandQuery: string
  readonly args: string
}

const normalize = (value: string): string =>
  value.trim().toLowerCase().replace(/^\/+/, "")

/** @Owl.TUI.Commands.Fuzzy.Parse - Split command query from arguments */
export const parsePaletteInput = (value: string): PaletteInputParts => {
  const body = value.trimStart().replace(/^\/+/, "")
  const firstSpace = body.indexOf(" ")

  if (firstSpace === -1) {
    return { commandQuery: body, args: "" }
  }

  return {
    commandQuery: body.slice(0, firstSpace),
    args: body.slice(firstSpace + 1).trimStart(),
  }
}

/** @Owl.TUI.Commands.Fuzzy.Complete - Complete command while preserving args */
export const completePaletteCommand = (
  value: string,
  commandName: string,
): string => {
  const { args } = parsePaletteInput(value)
  return "/" + commandName + (args.length > 0 ? " " + args : " ")
}

const scoreCommand = (command: PaletteCommand, rawQuery: string): number => {
  const query = normalize(rawQuery)
  const name = normalize(command.name)
  const description = command.description.toLowerCase()

  if (query.length === 0) return 1
  if (name === query) return 100
  if (name.startsWith(query)) return 80 - (name.length - query.length)
  if (name.includes(query)) return 60 - name.indexOf(query)
  if (description.includes(query)) return 30

  let score = 0
  let cursor = 0
  for (const char of query) {
    const found = name.indexOf(char, cursor)
    if (found === -1) return 0
    score += found === cursor ? 4 : 1
    cursor = found + 1
  }

  return score
}

const scorePendingMutationId = (mutationId: string, rawQuery: string): number => {
  const query = normalize(rawQuery)
  const id = normalize(mutationId)

  if (query.length === 0) return 1
  if (id === query) return 100
  if (id.startsWith(query)) return 80
  if (id.includes(query)) return 50 - id.indexOf(query)
  return 0
}

const rankedOrder = Order.make<RankedPaletteCommand>((left, right) => {
  const scoreDelta = right.score - left.score
  if (scoreDelta < 0) return -1
  if (scoreDelta > 0) return 1

  const nameDelta = left.name.localeCompare(right.name)
  if (nameDelta < 0) return -1
  if (nameDelta > 0) return 1
  return 0
})

/** @Owl.TUI.Commands.Fuzzy.Rank - Rank palette commands by query */
export const rankPaletteCommands = (
  commands: readonly PaletteCommand[],
  query: string,
): readonly RankedPaletteCommand[] =>
  Chunk.toReadonlyArray(
    Chunk.sort(
      Chunk.filter(
        Chunk.map(Chunk.fromIterable(commands), (command) =>
          Data.struct({
            ...command,
            score: scoreCommand(command, query),
          }),
        ),
        (command) => command.score > 0,
      ),
      rankedOrder,
    ),
  )

/** @Owl.TUI.Commands.Fuzzy.PendingIds - Rank pending Mutation IDs by argument */
export const rankPendingMutationIds = (
  mutationIds: Chunk.Chunk<string>,
  query: string,
): Chunk.Chunk<string> =>
  Chunk.map(
    Chunk.sort(
      Chunk.filter(
        Chunk.map(mutationIds, (mutationId) =>
          Data.struct({
            mutationId,
            score: scorePendingMutationId(mutationId, query),
          }),
        ),
        (entry) => entry.score > 0,
      ),
      Order.make<{ readonly mutationId: string; readonly score: number }>(
        (left, right) => {
          const scoreDelta = right.score - left.score
          if (scoreDelta < 0) return -1
          if (scoreDelta > 0) return 1

          const idDelta = left.mutationId.localeCompare(right.mutationId)
          if (idDelta < 0) return -1
          if (idDelta > 0) return 1
          return 0
        },
      ),
    ),
    (entry) => entry.mutationId,
  )

/** @Owl.TUI.Commands.Fuzzy.Suggestion - Inline ghost completion suffix */
export const getPaletteSuggestion = (
  value: string,
  commands: readonly PaletteCommand[],
  selectedIndex: number,
  pendingMutationIds: Chunk.Chunk<string> = Chunk.empty(),
): string => {
  if (!value.startsWith("/")) return ""

  const { commandQuery, args } = parsePaletteInput(value)
  if (
    value.includes(" ") &&
    HashSet.has(TUI_PENDING_ARGUMENT_COMMANDS, normalize(commandQuery))
  ) {
    const selectedMutationId = Chunk.get(
      rankPendingMutationIds(pendingMutationIds, args),
      0,
    )
    if (selectedMutationId._tag === "None") return ""

    const completed = "/" + commandQuery + " " + selectedMutationId.value + " "
    return completed.startsWith(value) ? completed.slice(value.length) : ""
  }

  if (args.length > 0) return ""

  const selected = rankPaletteCommands(commands, commandQuery)[selectedIndex]
  if (selected === undefined) return ""

  const completed = "/" + selected.name + " "
  return completed.startsWith(value) ? completed.slice(value.length) : ""
}
