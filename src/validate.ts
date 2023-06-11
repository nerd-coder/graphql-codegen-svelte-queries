import type { PluginValidateFn } from '@graphql-codegen/plugin-helpers'
import { type SvelteQueriesPluginConfig } from './config'

export const validate: PluginValidateFn<SvelteQueriesPluginConfig> = (_, __, config) => {
  if (!config.clientPath) throw new Error('`config.clientPath` is required')
  if (!config.clientType) throw new Error('`config.clientType` is required')
}
