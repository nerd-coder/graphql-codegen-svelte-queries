const operationImports = [
  'gql', // Re-exported
  'queryStore',
  'subscriptionStore',
]
const typedImports = [
  // Query
  'AnyVariables',
  'QueryArgs',
  'OperationResultState',
  // Subscription
  'SubscriptionArgs',
]
export const urqlImports = [
  `import { 
  ${[
    ...operationImports,
    ...typedImports.map(z => 'type ' + z), // prefix with type
  ].join(',\n')} 
} from '@urql/svelte'`,
]
