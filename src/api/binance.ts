import { QUOTE } from '../config/coins'

/** Binance public market-data endpoint: free, no API key, CORS enabled. */
export const BASE_URL = 'https://data-api.binance.vision/api/v3'
const TIMEOUT_MS = 10_000

export interface Ticker {
  symbol: string
  price: number
  changePercent: number
}

export type TickerMap = Record<string, Ticker>

export interface PricePoint {
  time: number
  price: number
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

function toNumber(value: unknown): number | null {
  const n =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : Number.NaN
  return Number.isFinite(n) ? n : null
}

async function getJson(path: string): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch {
    throw new ApiError('Could not reach the price service. Check your connection.')
  }
  if (!response.ok) {
    throw new ApiError(
      response.status === 429
        ? 'The price service is rate limiting requests. Retrying shortly.'
        : `The price service returned an error (HTTP ${response.status}).`,
    )
  }
  try {
    return await response.json()
  } catch {
    throw new ApiError('The price service returned a malformed response.')
  }
}

/** Validates a /ticker/24hr response. Invalid entries are skipped. */
export function parseTickers(raw: unknown): TickerMap {
  if (!Array.isArray(raw)) throw new ApiError('Received prices in an unexpected format.')

  const tickers: TickerMap = {}
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue
    const { symbol: pair, lastPrice, priceChangePercent } = item as Record<string, unknown>
    const price = toNumber(lastPrice)
    if (typeof pair !== 'string' || !pair.endsWith(QUOTE) || price === null || price <= 0) {
      continue
    }
    const symbol = pair.slice(0, -QUOTE.length)
    tickers[symbol] = { symbol, price, changePercent: toNumber(priceChangePercent) ?? 0 }
  }

  if (Object.keys(tickers).length === 0) {
    throw new ApiError('The price service returned no valid prices.')
  }
  return tickers
}

/** Validates a /klines response into [time, close price] points. */
export function parseKlines(raw: unknown): PricePoint[] {
  if (!Array.isArray(raw)) throw new ApiError('Received price history in an unexpected format.')

  const points: PricePoint[] = []
  for (const row of raw) {
    if (!Array.isArray(row)) continue
    const time = toNumber(row[0])
    const price = toNumber(row[4])
    if (time === null || price === null || price <= 0) continue
    points.push({ time, price })
  }

  if (points.length < 2) throw new ApiError('Not enough price history to draw a chart.')
  return points
}

export async function fetchTickers(symbols: string[]): Promise<TickerMap> {
  const pairs = JSON.stringify(symbols.map((symbol) => `${symbol}${QUOTE}`))
  return parseTickers(await getJson(`/ticker/24hr?symbols=${encodeURIComponent(pairs)}`))
}

/** Last 24 hours of prices in 5-minute candles. */
export async function fetchDailyHistory(symbol: string): Promise<PricePoint[]> {
  const pair = encodeURIComponent(`${symbol}${QUOTE}`)
  return parseKlines(await getJson(`/klines?symbol=${pair}&interval=5m&limit=288`))
}
