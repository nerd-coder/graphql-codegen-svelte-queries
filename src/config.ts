import type { TypeScriptPluginConfig } from '@graphql-codegen/typescript'
import type { TypeScriptDocumentsPluginConfig } from '@graphql-codegen/typescript-operations'

export interface SvelteApolloPluginConfig
  extends TypeScriptPluginConfig,
    TypeScriptDocumentsPluginConfig {
  /**
   * Path to the apollo client for this project
   * (should point to a file with an apollo-client as `default` export)
   */
  clientPath: string
  /** @default false */
  asyncQuery?: boolean
  /** @default 'Doc' */
  documentVariableSuffix?: string
}

export function getDefaultOptions(config?: SvelteApolloPluginConfig): SvelteApolloPluginConfig {
  const clientPath = config?.clientPath
  if (!clientPath) throw new Error('`config.clientPath` is required')
  return {
    ...config,
    clientPath,
    asyncQuery: config?.asyncQuery || false,
    documentVariableSuffix: config?.documentVariableSuffix || 'Doc',
  }
}
