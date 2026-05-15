/** @Owl.Commands.Utils.Ids - Deterministic command and mutation identifiers */
import { createHash } from "node:crypto"
import { COMMAND_CONSTANTS } from "../../core/constants/index.js"

const digestParts = (parts: readonly string[]): string =>
  createHash("sha256")
    .update(JSON.stringify(parts))
    .digest("hex")
    .slice(0, COMMAND_CONSTANTS.ID_HASH_LENGTH)

/** @Owl.Commands.Utils.TaskId - Stable Inference task ID */
export const makeCommandTaskId = (
  commandName: string,
  prompt: string,
): string =>
  `${COMMAND_CONSTANTS.ID_PREFIX}-${commandName}-${digestParts([
    commandName,
    prompt,
  ])}`

/** @Owl.Commands.Utils.MutationId - Stable Mutation pipeline ID */
export const makeMutationId = (
  kind: string,
  file: string,
  parts: readonly string[],
): string => `${kind}-${digestParts([kind, file, ...parts])}`
