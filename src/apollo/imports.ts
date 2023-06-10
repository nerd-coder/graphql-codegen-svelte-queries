const operationImports = [
  // Async query
  'QueryOptions',
  // Query
  'ApolloQueryResult',
  'ObservableQuery',
  'WatchQueryOptions',
  'OperationVariables',
  'DocumentNode',
  // Mutation
  'MutationOptions',
  // Subscription
  'SubscriptionOptions',
]
export const apolloImports = [
  `import type { ${operationImports.join(', ')} } from '@apollo/client'`,
  `import { gql, NetworkStatus } from '@apollo/client/core'`,
]
