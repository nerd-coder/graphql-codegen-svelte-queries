import { pascalCase } from 'pascal-case'
import type { SvelteApolloPluginConfig } from '../config'

export function genForUrqlMutation(
  operationName: string,
  operationType: string,
  config: SvelteApolloPluginConfig
) {
  const op = `${pascalCase(operationName)}${pascalCase(operationType)}`
  const opv = `${pascalCase(operationName)}${pascalCase(operationType)}Variables`
  const doc = `${pascalCase(operationName)}${config.documentVariableSuffix}`

  return `
export const ${operationName} = (variables: ${opv}) =>
  client.mutation<${op}, ${opv}>(${doc}, variables)`
}
