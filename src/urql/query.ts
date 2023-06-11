import { type SvelteQueriesPluginConfig } from '../config'
import { getNames } from '../naming'

export function genForUrqlQuery(
  operationName: string,
  operationType: string,
  config: SvelteQueriesPluginConfig
) {
  const [op, opv, doc] = getNames(operationName, operationType, config)

  let result = `
export const ${operationName} = (
  options?: ReadableQueryOption<${op}, ${opv}>
) =>
  __buildReadableResult(
    queryStore({ client: client, query: ${doc}, ...options } as QueryArgs<
      ${op},
      ${opv}
    >)
  )`
  if (config.asyncQuery)
    result += `
export const Async${operationName} = (variables: ${opv}) =>
  client.query<${op}, ${opv}>(${doc}, variables)`

  return result
}
