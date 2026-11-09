import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import type { SerializedError } from '@reduxjs/toolkit'
import { fetchDailyHistory, fetchTickers, type PricePoint, type TickerMap } from '../api/binance'
import { COINS } from '../config/coins'

export interface QueryError {
  message: string
}

const toQueryError = (error: unknown): QueryError => ({
  message: error instanceof Error ? error.message : 'Something went wrong.',
})

export function getErrorMessage(error: QueryError | SerializedError | undefined): string {
  return error?.message ?? 'Something went wrong.'
}

/** Prices live in Redux through RTK Query, which also handles caching and polling. */
export const marketApi = createApi({
  reducerPath: 'marketApi',
  baseQuery: fakeBaseQuery<QueryError>(),
  endpoints: (build) => ({
    getTickers: build.query<TickerMap, void>({
      async queryFn() {
        try {
          return { data: await fetchTickers(COINS.map((coin) => coin.symbol)) }
        } catch (error) {
          return { error: toQueryError(error) }
        }
      },
    }),
    getHistory: build.query<PricePoint[], string>({
      async queryFn(symbol) {
        try {
          return { data: await fetchDailyHistory(symbol) }
        } catch (error) {
          return { error: toQueryError(error) }
        }
      },
    }),
  }),
})

export const { useGetTickersQuery, useGetHistoryQuery } = marketApi
