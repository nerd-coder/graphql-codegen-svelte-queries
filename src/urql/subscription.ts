import { convertFactory } from '@graphql-codegen/visitor-plugin-common'
import type { SvelteQueriesPluginConfig } from '../config'

export function genForUrqlSubscription(
  operationName: string,
  operationType: string,
  config: SvelteQueriesPluginConfig
) {
  const convert = convertFactory(config)
  const op = convert(operationName) + convert(operationType)
  const opv = convert(operationName) + convert(operationType, { suffix: 'Variables' })
  const doc = convert(operationName, { suffix: config.documentVariableSuffix })

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
