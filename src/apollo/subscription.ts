import type { SvelteQueriesPluginConfig } from '../config'
import { getNames } from '../naming'

export function genForApolloSubscription(
  operationName: string,
  operationType: string,
  config: SvelteQueriesPluginConfig
) {
  const [op, opv, doc] = getNames(operationName, operationType, config)

  return `
export const ${operationName} = (options?: Omit<SubscriptionOptions<${opv}, ${op}>, "query">) =>
  client.subscribe<${op}, ${opv}>({ query: ${doc}, ...options })`
}
