import type { CodegenConfig } from '@graphql-codegen/cli'
import type { TypeScriptPluginConfig } from '@graphql-codegen/typescript'
import type { SvelteApolloPluginConfig } from '@nerd-coder/graphql-codegen-svelte-apollo'

const typescriptConfig: TypeScriptPluginConfig = {
  useTypeImports: true,
  strictScalars: true,
}

const codegenSvelteApollo: SvelteApolloPluginConfig = {
  clientPath: '../client',
  asyncQuery: true,
}

const config: CodegenConfig = {
  schema: 'e2e/schema/*.graphql',
  documents: 'e2e/schema/*.gql',
  generates: {
    'e2e/generated/_types.ts': {
      plugins: ['typescript', 'typescript-operations', 'dist/index.cjs'],
      config: {
        ...typescriptConfig,
        ...codegenSvelteApollo,
      },
    },
  },
}
export default config
