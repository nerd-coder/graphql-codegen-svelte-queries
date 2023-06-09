import { ApolloClient, InMemoryCache } from '@apollo/client/core'

const apolloClient = new ApolloClient({ cache: new InMemoryCache() })

export default apolloClient
