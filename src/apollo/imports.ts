import type { SvelteQueriesPluginConfig } from '../config'

const operationImports = [
  // Async query
  'QueryOptions',
  // Query
  'ApolloQueryResult',
  'ObservableQuery',
  'WatchQueryOptions',
  'OperationVariables',
  // Mutation
  'MutationOptions',
  // Subscription
  'SubscriptionOptions',
]
export const getApolloImports = (config: SvelteQueriesPluginConfig) => [
  `import ${config.useTypeImports ? 'type ' : ''}{ ${operationImports.join(
    ', '
  )} } from '@apollo/client'`,
  `import { gql, NetworkStatus } from '@apollo/client/core'`,
]
