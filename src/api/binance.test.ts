import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, fetchTickers, parseKlines, parseTickers } from './binance'

describe('parseTickers', () => {
  it('maps valid EUR tickers by coin symbol', () => {
    const tickers = parseTickers([
      { symbol: 'BTCEUR', lastPrice: '50000.10', priceChangePercent: '-1.5' },
      { symbol: 'ETHEUR', lastPrice: '2000', priceChangePercent: '3' },
    ])

    expect(tickers).toEqual({
      BTC: { symbol: 'BTC', price: 50000.1, changePercent: -1.5 },
      ETH: { symbol: 'ETH', price: 2000, changePercent: 3 },
    })
  })

  it('skips invalid entries and keeps the valid ones', () => {
    const tickers = parseTickers([
      { symbol: 'BTCEUR', lastPrice: 'not a number' },
      { symbol: 'ETHEUR', lastPrice: '-5' },
      null,
      { symbol: 'SOLEUR', lastPrice: '80' },
    ])

    expect(Object.keys(tickers)).toEqual(['SOL'])
    expect(tickers.SOL.changePercent).toBe(0)
  })

  it('throws when the payload is not usable', () => {
    expect(() => parseTickers({ code: -1121 })).toThrow(ApiError)
    expect(() => parseTickers([{ symbol: 'BTCEUR' }])).toThrow(/no valid prices/)
  })
})

describe('parseKlines', () => {
  it('extracts open time and close price', () => {
    expect(
      parseKlines([
        [1000, '1', '2', '0.5', '1.5'],
        [2000, '1.5', '2', '1', '1.8'],
      ]),
    ).toEqual([
      { time: 1000, price: 1.5 },
      { time: 2000, price: 1.8 },
    ])
  })

  it('throws when there is not enough valid history', () => {
    expect(() => parseKlines('oops')).toThrow(ApiError)
    expect(() => parseKlines([[1000, '1', '2', '0.5', 'bad']])).toThrow(/Not enough price history/)
  })
})

describe('fetchTickers', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('turns HTTP errors into a readable ApiError', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 500 })))
    await expect(fetchTickers(['BTC'])).rejects.toThrow('The price service returned an error (HTTP 500).')
  })

  it('turns network failures into a readable ApiError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch')
      }),
    )
    await expect(fetchTickers(['BTC'])).rejects.toThrow(/Could not reach the price service/)
  })

  it('rejects malformed JSON', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<html>', { status: 200 })))
    await expect(fetchTickers(['BTC'])).rejects.toThrow(/malformed response/)
  })
})
