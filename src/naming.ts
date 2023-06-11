import { convertFactory } from '@graphql-codegen/visitor-plugin-common'
import type { SvelteQueriesPluginConfig } from './config'

/** Get names for Operation, Operation Vaiables and DocumentNode */
export function getNames(
  operationName: string,
  operationType: string,
  config: SvelteQueriesPluginConfig
) {
  const convert = convertFactory(config)
  const op = convert(operationName) + convert(operationType)
  const opv = convert(operationName) + convert(operationType, { suffix: 'Variables' })
  const doc = convert(operationName, { suffix: config.documentVariableSuffix })

  return [op, opv, doc] as const
}
