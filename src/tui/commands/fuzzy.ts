/** @Owl.TUI.Commands.Fuzzy - Deterministic command palette ranking */

export interface PaletteCommand {
  readonly name: string
  readonly description: string
}

export interface RankedPaletteCommand extends PaletteCommand {
  readonly score: number
}

const normalize = (value: string): string =>
  value.trim().toLowerCase().replace(/^\/+/, "")

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

/** @Owl.TUI.Commands.Fuzzy.Rank - Rank palette commands by query */
export const rankPaletteCommands = (
  commands: readonly PaletteCommand[],
  query: string,
): readonly RankedPaletteCommand[] =>
  commands
    .map((command) => ({
      ...command,
      score: scoreCommand(command, query),
    }))
    .filter((command) => command.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
