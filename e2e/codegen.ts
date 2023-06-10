import type { CodegenConfig } from '@graphql-codegen/cli'
import type { TypeScriptPluginConfig } from '@graphql-codegen/typescript'
import type { SvelteApolloPluginConfig } from '@nerd-coder/graphql-codegen-svelte-queries'

const typescriptConfig: TypeScriptPluginConfig = {
  useTypeImports: true,
  strictScalars: true,
}

const codegenSvelteApollo: SvelteApolloPluginConfig = {
  clientPath: '../client',
  asyncQuery: true,
  clientType: 'apollo',
}
const codegenSvelteUrql: SvelteApolloPluginConfig = {
  clientPath: '../client',
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
        ...codegenSvelteApollo,
      },
    },
    'e2e/generated/_urql.ts': {
      plugins: ['typescript', 'typescript-operations', 'dist/index.cjs'],
      config: {
        ...typescriptConfig,
        ...codegenSvelteUrql,
      },
    },
  },
}
export default config
