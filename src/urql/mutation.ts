import type { SvelteQueriesPluginConfig } from '../config'
import { getNames } from '../naming'

export function genForUrqlMutation(
  operationName: string,
  operationType: string,
  config: SvelteQueriesPluginConfig
) {
  const [op, opv, doc] = getNames(operationName, operationType, config)

  return `
export const ${operationName} = (variables: ${opv}) =>
  client.mutation<${op}, ${opv}>(${doc}, variables)`
}
