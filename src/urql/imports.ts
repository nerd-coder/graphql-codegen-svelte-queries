import type { SvelteQueriesPluginConfig } from '../config'

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
export const getUrqlImports = (config: SvelteQueriesPluginConfig) => [
  `import { 
  ${[
    ...operationImports,
    ...typedImports.map(z => (config.useTypeImports ? 'type ' : '') + z),
  ].join(',\n')} 
} from '@urql/svelte'`,
]
