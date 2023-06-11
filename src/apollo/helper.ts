export const getApolloHelpers = () => [
  `
type ReadableQueryResult<
  T,
  V extends OperationVariables,
  K extends Exclude<keyof T, '__typename'>
> = {
  readonly query: ObservableQuery<T, V>
  readonly errorMessages: Readable<string[]>
  readonly rawData: Readable<T[K] | null>
} & Required<{
  readonly [P in keyof ApolloQueryResult<T>]: Readable<
    P extends 'data' ? T | null : ApolloQueryResult<T>[P]
  >
}>
type ReadableQueryOption<T, V extends OperationVariables> = Omit<WatchQueryOptions<V, T>, 'query'>

function __buildReadableResult<
  T,
  V extends OperationVariables,
  K extends Exclude<keyof T, '__typename'>
>(query: ObservableQuery<T, V>): ReadableQueryResult<T, V, K> {
  // const query = client.watchQuery({ query: doc, ...options })
  const result = readable<ApolloQueryResult<T | null>>(
    { data: null, loading: true, networkStatus: NetworkStatus.loading },
    set => {
      query.subscribe(
        v => set(v),
        e => set({ data: null, loading: false, error: e, networkStatus: NetworkStatus.error })
      )
    }
  )
  const data = derived(result, r => r.data)
  const rawData = derived(result, r => {
    if (!r.data) return null
    const k = Object.keys(r.data).filter(z => z !== '__typename')[0] as K
    if (!k) return null
    return r.data[k]
  })
  const error = derived(result, r => r.error)
  const errors = derived(result, r => r.errors)
  const loading = derived(result, r => r.loading)
  const networkStatus = derived(result, r => r.networkStatus)
  const partial = derived(result, r => r.partial)
  const errorMessages = derived(result, q => [
    ...(q.error ? [q.error.message] : []),
    ...(q.errors ? q.errors.map(z => z.message) : []),
  ])
  return { query, data, error, errors, loading, networkStatus, partial, errorMessages, rawData }
}`,
]
