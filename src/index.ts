import type { PluginFunction, PluginValidateFn, Types } from '@graphql-codegen/plugin-helpers'
import type { TypeScriptPluginConfig } from '@graphql-codegen/typescript'
import type { TypeScriptDocumentsPluginConfig } from '@graphql-codegen/typescript-operations'
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
import { pascalCase } from 'pascal-case'

export interface SvelteApolloPluginConfig
  extends TypeScriptPluginConfig,
    TypeScriptDocumentsPluginConfig {
  clientPath: string
  asyncQuery?: boolean
  documentVariableSuffix?: string
}

function getDefaultOptions(config?: SvelteApolloPluginConfig): SvelteApolloPluginConfig {
  const clientPath = config?.clientPath
  if (!clientPath) throw new Error('`config.clientPath` is required')
  return {
    ...config,
    clientPath,
    asyncQuery: config?.asyncQuery || false,
    documentVariableSuffix: config?.documentVariableSuffix || 'Doc',
  }
}

export const plugin: PluginFunction<SvelteApolloPluginConfig, Types.ComplexPluginOutput> = (
  schema,
  documents,
  _config
) => {
  const config = getDefaultOptions(_config)
  const allAst = concatAST(documents.map(d => d.document).filter((a): a is DocumentNode => !!a))

  const allFragments: LoadedFragment[] = [
    ...(
      allAst.definitions.filter(
        d => d.kind === Kind.FRAGMENT_DEFINITION
      ) as FragmentDefinitionNode[]
    ).map(fragmentDef => ({
      node: fragmentDef,
      name: fragmentDef.name.value,
      onType: fragmentDef.typeCondition.name.value,
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
type ReadableQueryResult<T, V extends OperationVariables> = {
  readonly query: ObservableQuery<T, V>
} & Required<{
  readonly [P in keyof ApolloQueryResult<T>]: Readable<
    P extends 'data' ? T | null : ApolloQueryResult<T>[P]
  >
}>`,
    `type ReadableQueryOption<T, V extends OperationVariables> = Omit<WatchQueryOptions<V, T>, 'query'>`,
    `
function __buildReadableQuery<T, V extends OperationVariables>(
  doc: DocumentNode,
  options?: ReadableQueryOption<T, V>
): ReadableQueryResult<T, V> {
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
  const error = derived(result, r => r.error)
  const errors = derived(result, r => r.errors)
  const loading = derived(result, r => r.loading)
  const networkStatus = derived(result, r => r.networkStatus)
  const partial = derived(result, r => r.partial)
  return { query, data, error, errors, loading, networkStatus, partial }
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

export const validate: PluginValidateFn<SvelteApolloPluginConfig> = (_, __, config) => {
  if (!config.clientPath) throw new Error('`config.clientPath` is required')
}

function genForQuery(
  operationName: string,
  operationType: string,
  config: SvelteApolloPluginConfig
) {
  const op = `${pascalCase(operationName)}${pascalCase(operationType)}`
  const opv = `${pascalCase(operationName)}${pascalCase(operationType)}Variables`
  const doc = `${pascalCase(operationName)}${config.documentVariableSuffix}`

  let result = `
export const ${operationName} = (options?: ReadableQueryOption<${op}, ${opv}>) =>
  __buildReadableQuery(${doc}, options)`
  if (config.asyncQuery)
    result += `
export const Async${operationName} = (options?: Omit<QueryOptions<${opv}, ${op}>, 'query'>) =>
  client.query<${op}, ${opv}>({ query: ${doc}, ...options })`

  return result
}

function genForMutation(
  operationName: string,
  operationType: string,
  config: SvelteApolloPluginConfig
) {
  const op = `${pascalCase(operationName)}${pascalCase(operationType)}`
  const opv = `${pascalCase(operationName)}${pascalCase(operationType)}Variables`
  const doc = `${pascalCase(operationName)}${config.documentVariableSuffix}`

  return `
export const ${operationName} = (options?: Omit<MutationOptions<${op}, ${opv}>, 'mutation'> ) =>
  client.mutate({ mutation: ${doc}, ...options })`
}

function genForSubscription(
  operationName: string,
  operationType: string,
  config: SvelteApolloPluginConfig
) {
  const op = `${pascalCase(operationName)}${pascalCase(operationType)}`
  const opv = `${pascalCase(operationName)}${pascalCase(operationType)}Variables`
  const doc = `${pascalCase(operationName)}${config.documentVariableSuffix}`

  return `
export const ${operationName} = (options?: Omit<SubscriptionOptions<${opv}, ${op}>, "query">) =>
  client.subscribe({ query: ${doc}, ...options })`
}
