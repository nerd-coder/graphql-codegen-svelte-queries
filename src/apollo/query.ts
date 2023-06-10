import { pascalCase } from 'pascal-case'
import { type SvelteApolloPluginConfig } from '../config'

export function genForQuery(
  operationName: string,
  operationType: string,
  config: SvelteApolloPluginConfig
) {
  const op = `${pascalCase(operationName)}${pascalCase(operationType)}`
  const opv = `${pascalCase(operationName)}${pascalCase(operationType)}Variables`
  const doc = `${pascalCase(operationName)}${config.documentVariableSuffix}`

  let result = `
export const ${operationName} = (options?: ReadableQueryOption<${op}, ${opv}>) =>
  __buildReadableQuery(${doc}, options)`
  if (config.asyncQuery)
    result += `
export const Async${operationName} = (options?: Omit<QueryOptions<${opv}, ${op}>, 'query'>) =>
  client.query<${op}, ${opv}>({ query: ${doc}, ...options })`

  return result
}
