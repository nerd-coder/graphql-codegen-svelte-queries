import type { IOperationSpec, SvelteQueriesPluginConfig } from '../config'

export const getApolloImports = (config: SvelteQueriesPluginConfig, spec: IOperationSpec) => [
  `import ${config.useTypeImports ? 'type ' : ''}{ ${[
    // Async query
    ...(spec.hasQ
      ? [
          'QueryOptions',
          // Query
          'ApolloQueryResult',
          'ObservableQuery',
          'WatchQueryOptions',
          'OperationVariables',
        ]
      : []),
    // Mutation
    ...(spec.hasM ? ['MutationOptions'] : []),
    // Subscription
    ...(spec.hasS ? ['SubscriptionOptions'] : []),
  ].join(', ')} } from '@apollo/client'`,
  `import { gql, NetworkStatus } from '@apollo/client/core'`,
]
