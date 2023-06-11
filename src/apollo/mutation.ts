import type { SvelteQueriesPluginConfig } from '../config'
import { getNames } from '../naming'

export function genForApolloMutation(
  operationName: string,
  operationType: string,
  config: SvelteQueriesPluginConfig
) {
  const [op, opv, doc] = getNames(operationName, operationType, config)

  return `
export const ${operationName} = (options?: Omit<MutationOptions<${op}, ${opv}>, 'mutation'> ) =>
  client.mutate({ mutation: ${doc}, ...options })`
}
