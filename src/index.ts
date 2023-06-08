import type { PluginFunction, PluginValidateFn, Types } from '@graphql-codegen/plugin-helpers'
import { ClientSideBaseVisitor, type LoadedFragment } from '@graphql-codegen/visitor-plugin-common'
import {
  concatAST,
  Kind,
  type DocumentNode,
  type FragmentDefinitionNode,
  type OperationDefinitionNode,
  visit,
} from 'graphql'
import { pascalCase } from 'pascal-case'

interface Config {
  clientPath?: string
  asyncQuery?: boolean
}

export const plugin: PluginFunction<Config, Types.ComplexPluginOutput> = (
  schema,
  documents,
  config
) => {
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
  ]

  const visitor = new ClientSideBaseVisitor(
    schema,
    allFragments,
    {},
    { documentVariableSuffix: 'Doc' },
    documents
  )
  const visitorResult = visit(allAst, visitor)

  const operations = allAst.definitions.filter(
    d => d.kind === Kind.OPERATION_DEFINITION
  ) as OperationDefinitionNode[]

  const operationImport = `${
    operations.some(op => op.operation == 'query')
      ? `ApolloQueryResult, ObservableQuery, WatchQueryOptions, ${
          config.asyncQuery ? 'QueryOptions, ' : ''
        }`
      : ''
  }${operations.some(op => op.operation == 'mutation') ? 'MutationOptions, ' : ''}${
    operations.some(op => op.operation == 'subscription') ? 'SubscriptionOptions, ' : ''
  }`.slice(0, -2)

  const imports = [
    `import client from "${config.clientPath}";`,
    `import type { ${operationImport} } from "@apollo/client";`,
    `import { readable } from "svelte/store";`,
    `import type { Readable } from "svelte/store";`,
    `import gql from "graphql-tag"`,
  ]

  const ops = operations
    .map(o => {
      const operationName = o.name?.value
      if (!operationName) return null

      const dsl = `export const ${operationName}Doc = gql\`${
        documents.find(d => d.rawSDL?.includes(`${o.operation} ${operationName}`))?.rawSDL
      }\``
      const op = `${pascalCase(operationName)}${pascalCase(o.operation)}`
      const opv = `${op}Variables`
      let operation
      if (o.operation == 'query') {
        operation = `export const ${operationName} = (
            options: Omit<
              WatchQueryOptions<${opv}>, 
              "query"
            >
          ): Readable<
            ApolloQueryResult<${op}> & {
              query: ObservableQuery<
                ${op},
                ${opv}
              >;
            }
          > => {
            const q = client.watchQuery({
              query: ${pascalCase(operationName)}Doc,
              ...options,
            });
            var result = readable<
              ApolloQueryResult<${op}> & {
                query: ObservableQuery<
                  ${op},
                  ${opv}
                >;
              }
            >(
              { data: {} as any, loading: true, error: undefined, networkStatus: 1, query: q },
              (set) => {
                q.subscribe((v: any) => {
                  set({ ...v, query: q });
                });
              }
            );
            return result;
          }
        `
        if (config.asyncQuery) {
          operation =
            operation +
            `
              export const Async${operationName} = (
                options: Omit<
                  QueryOptions<${opv}>,
                  "query"
                >
              ) => {
                return client.query<${op}>({query: ${pascalCase(operationName)}Doc, ...options})
              }
            `
        }
      }
      if (o.operation == 'mutation') {
        operation = `export const ${operationName} = (
            options: Omit<
              MutationOptions<any, ${opv}>, 
              "mutation"
            >
          ) => {
            const m = client.mutate<${op}, ${opv}>({
              mutation: ${pascalCase(operationName)}Doc,
              ...options,
            });
            return m;
          }`
      }
      if (o.operation == 'subscription') {
        operation = `export const ${operationName} = (
            options: Omit<SubscriptionOptions<${opv}>, "query">
          ) => {
            const q = client.subscribe<${op}, ${opv}>(
              {
                query: ${pascalCase(operationName)}Doc,
                ...options,
              }
            )
            return q;
          }`
      }
      return operation
    })
    .join('\n')
  return {
    prepend: imports,
    content: [
      visitor.fragments,
      ...visitorResult.definitions.filter(t => typeof t == 'string'),
      ops,
    ].join('\n'),
  }
}

export const validate: PluginValidateFn<Config> = (_, __, config) => {
  if (!config.clientPath) {
    console.warn('Client path is not present in config')
  }
}
