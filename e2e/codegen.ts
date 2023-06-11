import type { CodegenConfig } from '@graphql-codegen/cli'
import type { TypeScriptPluginConfig } from '@graphql-codegen/typescript'
import type { TypeScriptDocumentsPluginConfig } from '@graphql-codegen/typescript-operations'
import type { SvelteQueriesPluginConfig } from '@nerd-coder/graphql-codegen-svelte-queries'

const typescriptConfig: TypeScriptPluginConfig = {
  useTypeImports: true,
  strictScalars: true,
}

const typeScriptDocumentsPluginConfig: TypeScriptDocumentsPluginConfig = {
  onlyOperationTypes: true,
}

const codegenSvelteApollo: SvelteQueriesPluginConfig = {
  clientPath: '../apollo-client',
  importFrom: './_types',
  asyncQuery: true,
  useTypeImports: true,
  clientType: 'apollo',
}
const codegenSvelteUrql: SvelteQueriesPluginConfig = {
  clientPath: '../urql-client',
  importFrom: './_types',
  asyncQuery: true,
  useTypeImports: true,
  clientType: 'urql',
}

const config: CodegenConfig = {
  schema: 'e2e/schema/*.graphql',
  documents: 'e2e/schema/*.gql',
  generates: {
    'e2e/generated/_types.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        ...typescriptConfig,
        ...typeScriptDocumentsPluginConfig,
      },
    },
    'e2e/generated/_apollo.ts': {
      plugins: ['dist/index.cjs'],
      config: { ...codegenSvelteApollo },
    },
    'e2e/generated/_urql.ts': {
      plugins: ['dist/index.cjs'],
      config: { ...codegenSvelteUrql },
    },
  },
}
export default config
