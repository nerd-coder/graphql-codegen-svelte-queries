import { convertFactory } from '@graphql-codegen/visitor-plugin-common'
import type { SvelteQueriesPluginConfig } from '../config'

export function genForApolloSubscription(
  operationName: string,
  operationType: string,
  config: SvelteQueriesPluginConfig
) {
  const convert = convertFactory(config)
  const op = convert(operationName) + convert(operationType)
  const opv = convert(operationName) + convert(operationType, { suffix: 'Variables' })
  const doc = convert(operationName, { suffix: config.documentVariableSuffix })

  return `
export const ${operationName} = (options?: Omit<SubscriptionOptions<${opv}, ${op}>, "query">) =>
  client.subscribe<${op}, ${opv}>({ query: ${doc}, ...options })`
}
