import { convertFactory } from '@graphql-codegen/visitor-plugin-common'
import { type SvelteApolloPluginConfig } from '../config'

export function genForApolloQuery(
  operationName: string,
  operationType: string,
  config: SvelteApolloPluginConfig
) {
  const convert = convertFactory(config)
  const op = convert(operationName) + convert(operationType)
  const opv = convert(operationName) + convert(operationType, { suffix: 'Variables' })
  const doc = convert(operationName, { suffix: config.documentVariableSuffix })

  let result = `
export const ${operationName} = (options?: ReadableQueryOption<${op}, ${opv}>) =>
  __buildReadableResult(client.watchQuery({ query: ${doc}, ...options }))`
  if (config.asyncQuery)
    result += `
export const Async${operationName} = (options?: Omit<QueryOptions<${opv}, ${op}>, 'query'>) =>
  client.query<${op}, ${opv}>({ query: ${doc}, ...options })`

  return result
}
