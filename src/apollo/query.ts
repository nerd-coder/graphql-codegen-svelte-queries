import { type SvelteQueriesPluginConfig } from '../config'
import { getNames } from '../naming'

export function genForApolloQuery(
  operationName: string,
  operationType: string,
  config: SvelteQueriesPluginConfig
) {
  const [op, opv, doc] = getNames(operationName, operationType, config)

  let result = `
export const ${operationName} = (options?: ReadableQueryOption<${op}, ${opv}>) =>
  __buildReadableResult(client.watchQuery({ query: ${doc}, ...options }))`
  if (config.asyncQuery)
    result += `
export const Async${operationName} = (options?: Omit<QueryOptions<${opv}, ${op}>, 'query'>) =>
  client.query<${op}, ${opv}>({ query: ${doc}, ...options })`

  return result
}
