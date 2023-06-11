import { Client } from '@urql/svelte'

const urqlClient = new Client({ url: `/q`, exchanges: [] })

export default urqlClient
