/** @Owl.CLI.Help - Formats process entrypoint output */
import { CLI_CONSTANTS } from "../core/constants/index.js"

const formatOption = (option: readonly [string, string]): string =>
  "  " + option[0].padEnd(18) + option[1]

/** @Owl.CLI.Help.Text - Renders deterministic CLI help */
export const formatCliHelp = (): string =>
  [
    CLI_CONSTANTS.BINARY_NAME + " - " + CLI_CONSTANTS.DESCRIPTION,
    "",
    "Usage:",
    "  " + CLI_CONSTANTS.USAGE,
    "",
    "Options:",
    ...CLI_CONSTANTS.OPTIONS.map(formatOption),
    "",
  ].join("\n")

/** @Owl.CLI.Help.Version - Renders deterministic CLI version */
export const formatCliVersion = (): string =>
  CLI_CONSTANTS.BINARY_NAME + " " + CLI_CONSTANTS.VERSION + "\n"
