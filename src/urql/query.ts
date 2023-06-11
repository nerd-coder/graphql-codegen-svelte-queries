import { pascalCase } from 'pascal-case'
import { type SvelteApolloPluginConfig } from '../config'

export function genForUrqlQuery(
  operationName: string,
  operationType: string,
  config: SvelteApolloPluginConfig
) {
  const op = `${pascalCase(operationName)}${pascalCase(operationType)}`
  const opv = `${pascalCase(operationName)}${pascalCase(operationType)}Variables`
  const doc = `${pascalCase(operationName)}${config.documentVariableSuffix}`

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
