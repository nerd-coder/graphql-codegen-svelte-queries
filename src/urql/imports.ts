import type { IOperationSpec, SvelteQueriesPluginConfig } from '../config'

export const getUrqlImports = (config: SvelteQueriesPluginConfig, spec: IOperationSpec) => [
  `import { ${[
    'gql', // Re-exported
    ...(spec.hasQ ? ['queryStore'] : []),
    ...(spec.hasS ? ['subscriptionStore'] : []),
    ...[
      ...(spec.hasQ ? ['AnyVariables', 'QueryArgs', 'OperationResultState'] : []),
      ...(spec.hasS ? ['SubscriptionArgs'] : []),
    ].map(z => (config.useTypeImports ? 'type ' : '') + z),
  ].join(', ')} } from '@urql/svelte'`,
]
