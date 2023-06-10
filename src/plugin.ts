import type { PluginFunction, Types } from '@graphql-codegen/plugin-helpers'
import { ClientSideBaseVisitor, type LoadedFragment } from '@graphql-codegen/visitor-plugin-common'
import {
  concatAST,
  Kind,
  type DocumentNode,
  type FragmentDefinitionNode,
  type OperationDefinitionNode,
  visit,
  OperationTypeNode,
} from 'graphql'
import { getDefaultOptions, type SvelteApolloPluginConfig } from './config'
import { genForQuery } from './apollo/query'
import { genForMutation } from './apollo/mutation'
import { genForSubscription } from './apollo/subscription'

export const plugin: PluginFunction<SvelteApolloPluginConfig, Types.ComplexPluginOutput> = (
  schema,
  documents,
  _config
) => {
  const config = getDefaultOptions(_config)
  const allAst = concatAST(documents.map(d => d.document).filter((a): a is DocumentNode => !!a))

  const allFragments: LoadedFragment[] = [
    ...allAst.definitions
      .filter((d): d is FragmentDefinitionNode => d.kind === Kind.FRAGMENT_DEFINITION)
      .map<LoadedFragment>(def => ({
        node: def,
        name: def.name.value,
        onType: def.typeCondition.name.value,
        isExternal: false,
      })),
    ...(config.externalFragments || []),
  ]

  const visitor = new ClientSideBaseVisitor(
    schema,
    allFragments,
    config,
    { documentVariableSuffix: config.documentVariableSuffix },
    documents
  )
  const visitorResult = visit(allAst, visitor)

  const operations = allAst.definitions.filter(
    (d): d is OperationDefinitionNode => d.kind === Kind.OPERATION_DEFINITION
  )

  const operationImports = [
    ...(config.asyncQuery ? ['QueryOptions'] : []),
    ...(operations.some(op => op.operation == 'query')
      ? [
          'ApolloQueryResult',
          'ObservableQuery',
          'WatchQueryOptions',
          'OperationVariables',
          'DocumentNode',
        ]
      : []),
    ...(operations.some(op => op.operation == 'mutation') ? ['MutationOptions'] : []),
    ...(operations.some(op => op.operation == 'subscription') ? ['SubscriptionOptions'] : []),
  ]

  const imports = [
    `import type { ${operationImports.join(', ')} } from '@apollo/client'`,
    `import { gql, NetworkStatus } from '@apollo/client/core'`,
    `import { readable, derived, type Readable } from 'svelte/store'`,
    `import client from '${config.clientPath}'`,
  ]
  const helpers = [
    `
type ReadableQueryResult<
  T,
  V extends OperationVariables,
  K extends Exclude<keyof T, '__typename'>
> = {
  readonly query: ObservableQuery<T, V>
  readonly errorMessages: Readable<string[]>
  readonly rawData: Readable<T[K] | null>
} & Required<{
  readonly [P in keyof ApolloQueryResult<T>]: Readable<
    P extends 'data' ? T | null : ApolloQueryResult<T>[P]
  >
}>`,
    `type ReadableQueryOption<T, V extends OperationVariables> = Omit<WatchQueryOptions<V, T>, 'query'>`,
    `
function __buildReadableQuery<
  T,
  V extends OperationVariables,
  K extends Exclude<keyof T, '__typename'>
>(doc: DocumentNode, options?: ReadableQueryOption<T, V>): ReadableQueryResult<T, V, K> {
  const query = client.watchQuery({ query: doc, ...options })
  const result = readable<ApolloQueryResult<T | null>>(
    { data: null, loading: true, networkStatus: NetworkStatus.loading },
    set => {
      query.subscribe(
        v => set(v),
        e => set({ data: null, loading: false, error: e, networkStatus: NetworkStatus.error })
      )
    }
  )
  const data = derived(result, r => r.data)
  const rawData = derived(result, r => {
    if (!r.data) return null
    const k = Object.keys(r.data).filter(z => z !== '__typename')[0] as K
    if (!k) return null
    return r.data[k]
  })
  const error = derived(result, r => r.error)
  const errors = derived(result, r => r.errors)
  const loading = derived(result, r => r.loading)
  const networkStatus = derived(result, r => r.networkStatus)
  const partial = derived(result, r => r.partial)
  const errorMessages = derived(result, q => [
    ...(q.error ? [q.error.message] : []),
    ...(q.errors ? q.errors.map(z => z.message) : []),
  ])
  return { query, data, error, errors, loading, networkStatus, partial, errorMessages, rawData }
}`,
  ]

  const ops: string[] = []
  for (const o of operations) {
    const operationName = o.name?.value
    if (!operationName) continue

    if (o.operation === OperationTypeNode.QUERY)
      ops.push(genForQuery(operationName, o.operation, config))
    else if (o.operation === OperationTypeNode.MUTATION)
      ops.push(genForMutation(operationName, o.operation, config))
    else if (o.operation === OperationTypeNode.SUBSCRIPTION)
      ops.push(genForSubscription(operationName, o.operation, config))
  }

  return {
    prepend: [...imports, ...helpers],
    content: [
      visitor.fragments,
      ...visitorResult.definitions.filter(t => typeof t == 'string'),
      ...ops,
    ].join('\n'),
  }
}
