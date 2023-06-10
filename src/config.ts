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
  /** Type of client. Support `apollo` and `urql` */
  clientType: 'apollo' | 'urql'
  /** @default false */
  asyncQuery?: boolean
  /** @default 'Doc' */
  documentVariableSuffix?: string
}

export function getDefaultOptions(config?: SvelteApolloPluginConfig): SvelteApolloPluginConfig {
  const clientPath = config?.clientPath
  const clientType = config?.clientType
  if (!clientPath) throw new Error('`config.clientPath` is required')
  if (!clientType) throw new Error('`config.clientType` is required')
  return {
    ...config,
    clientPath,
    clientType,
    asyncQuery: config?.asyncQuery || false,
    documentVariableSuffix: config?.documentVariableSuffix || 'Doc',
  }
}
