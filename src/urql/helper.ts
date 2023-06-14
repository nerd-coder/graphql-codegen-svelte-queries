import type { IOperationSpec } from '../config'

export const getUrqlHelpers = (spec: IOperationSpec) => [
  ...(spec.hasS
    ? [
        `type ReadableSubscriptionOption<T, V extends AnyVariables> = Omit<SubscriptionArgs<T, V>, 'query' | 'client'>`,
      ]
    : []),
  ...(spec.hasQ
    ? [
        `type ReadableQueryOption<T, V extends AnyVariables> = Omit<QueryArgs<T, V>, 'query' | 'client'>`,
        `type ReadableQueryResult<T, V extends AnyVariables, K extends Exclude<keyof T, '__typename'>> = {
  readonly query: ReturnType<typeof queryStore<T, V>>
  readonly rawData: Readable<T[K] | null>
} & Required<{
  readonly [P in keyof OperationResultState<T, V>]: Readable<OperationResultState<T>[P]>
}>`,
        `function __buildReadableResult<
  T,
  V extends AnyVariables,
  K extends Exclude<keyof T, '__typename'> = Exclude<keyof T, '__typename'>
>(result: ReturnType<typeof queryStore<T, V>>): ReadableQueryResult<T, V, K> {
  const data = derived(result, r => r.data)
  const rawData = derived(result, r => {
    if (!r.data) return null
    const k = Object.keys(r.data).filter(z => z !== '__typename')[0] as K
    if (!k) return null
    return r.data[k]
  })
  const error = derived(result, r => r.error)
  const fetching = derived(result, r => r.fetching)
  const hasNext = derived(result, r => r.hasNext)
  const operation = derived(result, r => r.operation)
  const stale = derived(result, r => r.stale)
  return {
    query: result,
    data,
    error,
    fetching,
    hasNext,
    operation,
    stale,
    rawData,
    extensions: readable(),
  }
}`,
      ]
    : []),
]
