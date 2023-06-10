import type { TypeScriptPluginConfig } from '@graphql-codegen/typescript'
import type { TypeScriptDocumentsPluginConfig } from '@graphql-codegen/typescript-operations'

export interface SvelteApolloPluginConfig
  extends TypeScriptPluginConfig,
    TypeScriptDocumentsPluginConfig {
  clientPath: string
  asyncQuery?: boolean
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
