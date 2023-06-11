import { convertFactory } from '@graphql-codegen/visitor-plugin-common'
import type { SvelteApolloPluginConfig } from '../config'

export function genForApolloMutation(
  operationName: string,
  operationType: string,
  config: SvelteApolloPluginConfig
) {
  const convert = convertFactory(config)
  const op = convert(operationName) + convert(operationType)
  const opv = convert(operationName) + convert(operationType, { suffix: 'Variables' })
  const doc = convert(operationName, { suffix: config.documentVariableSuffix })

  return `
export const ${operationName} = (options?: Omit<MutationOptions<${op}, ${opv}>, 'mutation'> ) =>
  client.mutate({ mutation: ${doc}, ...options })`
}
