import { convertFactory } from '@graphql-codegen/visitor-plugin-common'
import type { SvelteQueriesPluginConfig } from '../config'

export function genForUrqlMutation(
  operationName: string,
  operationType: string,
  config: SvelteQueriesPluginConfig
) {
  const convert = convertFactory(config)
  const op = convert(operationName) + convert(operationType)
  const opv = convert(operationName) + convert(operationType, { suffix: 'Variables' })
  const doc = convert(operationName, { suffix: config.documentVariableSuffix })

  return `
export const ${operationName} = (variables: ${opv}) =>
  client.mutation<${op}, ${opv}>(${doc}, variables)`
}
