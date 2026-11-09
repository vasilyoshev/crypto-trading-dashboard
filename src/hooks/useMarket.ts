import { useGetTickersQuery } from '../store/marketApi'
import { useAppSelector } from '../store/hooks'

export const PRICE_POLL_MS = 10_000
export const HISTORY_POLL_MS = 60_000

/** Live prices for all coins, refreshed every 10 seconds. */
export function useTickers() {
  return useGetTickersQuery(undefined, {
    pollingInterval: PRICE_POLL_MS,
    skipPollingIfUnfocused: true,
  })
}

export function useSelectedSymbol(): string {
  return useAppSelector((state) => state.ui.selectedSymbol)
}
