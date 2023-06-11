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
import { getDefaultOptions, type SvelteQueriesPluginConfig } from './config'
import { genForApolloQuery } from './apollo/query'
import { genForApolloMutation } from './apollo/mutation'
import { genForApolloSubscription } from './apollo/subscription'
import { getApolloHelpers } from './apollo/helper'
import { getApolloImports } from './apollo/imports'
import { genForUrqlQuery } from './urql/query'
import { genForUrqlMutation } from './urql/mutation'
import { genForUrqlSubscription } from './urql/subscription'
import { getUrqlImports } from './urql/imports'
import { getUrqlHelpers } from './urql/helper'

export const plugin: PluginFunction<SvelteQueriesPluginConfig, Types.ComplexPluginOutput> = (
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

  const visitor = new ClientSideBaseVisitor(schema, allFragments, config, config, documents)
  const visitorResult = visit(allAst, visitor)

  const operations = allAst.definitions.filter(
    (d): d is OperationDefinitionNode => d.kind === Kind.OPERATION_DEFINITION
  )

  const prepend = [
    `import { readable, derived, type Readable } from 'svelte/store'`,
    `import client from '${config.clientPath}'`,
    ...(config.clientType === 'apollo'
      ? [...getApolloImports(config), ...getApolloHelpers()]
      : [...getUrqlImports(config), ...getUrqlHelpers()]),
  ]

  const ops: string[] = []
  for (const o of operations) {
    const operationName = o.name?.value
    if (!operationName) continue

    const genQ = config.clientType === 'apollo' ? genForApolloQuery : genForUrqlQuery
    const genM = config.clientType === 'apollo' ? genForApolloMutation : genForUrqlMutation
    const genS = config.clientType === 'apollo' ? genForApolloSubscription : genForUrqlSubscription
    const gen =
      o.operation === OperationTypeNode.QUERY
        ? genQ
        : o.operation === OperationTypeNode.MUTATION
        ? genM
        : o.operation === OperationTypeNode.SUBSCRIPTION
        ? genS
        : null

    if (gen) ops.push(gen(operationName, o.operation, config))
  }

  return {
    prepend,
    content: [
      visitor.fragments,
      ...visitorResult.definitions.filter(t => typeof t == 'string'),
      ...ops,
    ].join('\n'),
  }
}
