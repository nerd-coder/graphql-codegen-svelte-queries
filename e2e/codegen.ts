import type { CodegenConfig } from '@graphql-codegen/cli'
import type { TypeScriptPluginConfig } from '@graphql-codegen/typescript'
import type { TypeScriptDocumentsPluginConfig } from '@graphql-codegen/typescript-operations'
import type { SvelteQueriesPluginConfig } from '@nerd-coder/graphql-codegen-svelte-queries'

const typescriptConfig: TypeScriptPluginConfig = {
  useTypeImports: true,
  strictScalars: true,
}

const typeScriptDocumentsPluginConfig: TypeScriptDocumentsPluginConfig = {
  noExport: true,
  onlyOperationTypes: true,
}

const codegenSvelteApollo: SvelteQueriesPluginConfig = {
  clientPath: '../apollo-client',
  asyncQuery: true,
  clientType: 'apollo',
}
const codegenSvelteUrql: SvelteQueriesPluginConfig = {
  clientPath: '../urql-client',
  asyncQuery: true,
  clientType: 'urql',
}

const config: CodegenConfig = {
  schema: 'e2e/schema/*.graphql',
  documents: 'e2e/schema/*.gql',
  generates: {
    'e2e/generated/_apollo.ts': {
      plugins: ['typescript', 'typescript-operations', 'dist/index.cjs'],
      config: {
        ...typescriptConfig,
        ...typeScriptDocumentsPluginConfig,
        ...codegenSvelteApollo,
      },
    },
    'e2e/generated/_urql.ts': {
      plugins: ['typescript', 'typescript-operations', 'dist/index.cjs'],
      config: {
        ...typescriptConfig,
        ...typeScriptDocumentsPluginConfig,
        ...codegenSvelteUrql,
      },
    },
  },
}
export default config
