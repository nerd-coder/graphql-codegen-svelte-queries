import { convertFactory } from '@graphql-codegen/visitor-plugin-common'
import { type SvelteQueriesPluginConfig } from '../config'

export function genForUrqlQuery(
  operationName: string,
  operationType: string,
  config: SvelteQueriesPluginConfig
) {
  const convert = convertFactory(config)
  const op = convert(operationName) + convert(operationType)
  const opv = convert(operationName) + convert(operationType, { suffix: 'Variables' })
  const doc = convert(operationName, { suffix: config.documentVariableSuffix })

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
