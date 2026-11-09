import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'
import { Provider } from 'react-redux'
import { vi } from 'vitest'
import { makeStore, type RootState } from '../store'

export function renderWithStore(
  ui: ReactElement,
  { preloadedState, ...options }: { preloadedState?: Partial<RootState> } & RenderOptions = {},
) {
  const store = makeStore(preloadedState)
  return { store, ...render(<Provider store={store}>{ui}</Provider>, options) }
}

export const tickerResponse = [
  { symbol: 'BTCEUR', lastPrice: '50000.00', priceChangePercent: '2.5' },
  { symbol: 'ETHEUR', lastPrice: '2000.00', priceChangePercent: '-1.25' },
]

export const klinesResponse = [
  [1_700_000_000_000, '49000', '49500', '48900', '49200'],
  [1_700_000_300_000, '49200', '50100', '49100', '50000'],
]

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

/** Replaces fetch with a fake Binance API. Pass `fail` to simulate an outage. */
export function mockBinance({ fail = false } = {}) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    if (fail) return jsonResponse({ msg: 'Service unavailable' }, 503)
    const url = String(input)
    if (url.includes('/ticker/24hr')) return jsonResponse(tickerResponse)
    if (url.includes('/klines')) return jsonResponse(klinesResponse)
    return jsonResponse({ msg: 'Not found' }, 404)
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}
