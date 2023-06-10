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
import { apolloHelpers } from './apollo/helper'
import { apolloImports } from './apollo/imports'

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

  const imports = [
    `import { readable, derived, type Readable } from 'svelte/store'`,
    `import client from '${config.clientPath}'`,
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
    prepend: [...imports, ...apolloImports, ...apolloHelpers],
    content: [
      visitor.fragments,
      ...visitorResult.definitions.filter(t => typeof t == 'string'),
      ...ops,
    ].join('\n'),
  }
}
