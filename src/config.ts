import type { RawConfig, RawTypesConfig } from '@graphql-codegen/visitor-plugin-common'

export interface SvelteQueriesPluginConfig
  extends Pick<RawTypesConfig, 'externalFragments'>,
    Pick<RawConfig, 'namingConvention'> {
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

export function getDefaultOptions(config?: SvelteQueriesPluginConfig): SvelteQueriesPluginConfig {
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
