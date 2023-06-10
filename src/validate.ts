import type { PluginValidateFn } from '@graphql-codegen/plugin-helpers'
import { type SvelteApolloPluginConfig } from './config'

export const validate: PluginValidateFn<SvelteApolloPluginConfig> = (_, __, config) => {
  if (!config.clientPath) throw new Error('`config.clientPath` is required')
}
