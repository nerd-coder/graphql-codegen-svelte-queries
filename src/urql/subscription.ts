import type { SvelteQueriesPluginConfig } from '../config'
import { getNames } from '../naming'

export function genForUrqlSubscription(
  operationName: string,
  operationType: string,
  config: SvelteQueriesPluginConfig
) {
  const [op, opv, doc] = getNames(operationName, operationType, config)

  return `
export const ${operationName} = (
  options?: ReadableSubscriptionOption<
    ${op},
    ${opv}
  >
) =>
  __buildReadableResult(
    subscriptionStore({ client: client, query: ${doc}, ...options } as SubscriptionArgs<
      ${op},
      ${opv}
    >)
  )`
}
