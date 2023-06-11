import { pascalCase } from 'pascal-case'
import type { SvelteApolloPluginConfig } from '../config'

export function genForApolloMutation(
  operationName: string,
  operationType: string,
  config: SvelteApolloPluginConfig
) {
  const op = `${pascalCase(operationName)}${pascalCase(operationType)}`
  const opv = `${pascalCase(operationName)}${pascalCase(operationType)}Variables`
  const doc = `${pascalCase(operationName)}${config.documentVariableSuffix}`

  return `
export const ${operationName} = (options?: Omit<MutationOptions<${op}, ${opv}>, 'mutation'> ) =>
  client.mutate({ mutation: ${doc}, ...options })`
}
