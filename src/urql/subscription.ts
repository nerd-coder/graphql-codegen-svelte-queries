import { pascalCase } from 'pascal-case'
import type { SvelteApolloPluginConfig } from '../config'

export function genForUrqlSubscription(
  operationName: string,
  operationType: string,
  config: SvelteApolloPluginConfig
) {
  const op = `${pascalCase(operationName)}${pascalCase(operationType)}`
  const opv = `${pascalCase(operationName)}${pascalCase(operationType)}Variables`
  const doc = `${pascalCase(operationName)}${config.documentVariableSuffix}`

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
