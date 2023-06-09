import type { CodegenConfig } from '@graphql-codegen/cli'
import type { TypeScriptPluginConfig } from '@graphql-codegen/typescript'
import type { SvelteApolloPluginConfig } from '@nerd-coder/graphql-codegen-svelte-apollo'

const typescriptConfig: TypeScriptPluginConfig = {
  useTypeImports: true,
  strictScalars: true,
  // defaultMapper: 'Partial<{T}>',
}

const codegenSvelteApollo: SvelteApolloPluginConfig = {
  clientPath: '../client',
  asyncQuery: true,
}

const config: CodegenConfig = {
  schema: 'tests/e2e/schema/*.graphql',
  documents: 'tests/e2e/schema/*.gql',
  generates: {
    'tests/e2e/generated/_types.ts': {
      plugins: ['typescript', 'typescript-operations', '../../dist/index.cjs'],
      config: {
        ...typescriptConfig,
        ...codegenSvelteApollo,
      },
    },
  },
}
export default config
