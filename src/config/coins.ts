export interface Coin {
  symbol: string
  name: string
}

/** Quote currency for all prices and the mock cash balance. */
export const QUOTE = 'EUR'

export const DEFAULT_SYMBOL = 'BTC'

/** Coins that have a EUR market on Binance. */
export const COINS: Coin[] = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'BNB', name: 'BNB' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'XRP', name: 'XRP' },
  { symbol: 'ADA', name: 'Cardano' },
  { symbol: 'DOGE', name: 'Dogecoin' },
  { symbol: 'TRX', name: 'TRON' },
  { symbol: 'LTC', name: 'Litecoin' },
  { symbol: 'LINK', name: 'Chainlink' },
  { symbol: 'AVAX', name: 'Avalanche' },
  { symbol: 'DOT', name: 'Polkadot' },
]

export function getCoinName(symbol: string): string {
  return COINS.find((coin) => coin.symbol === symbol)?.name ?? symbol
}

export function filterCoins(coins: Coin[], query: string): Coin[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return coins
  return coins.filter(
    (coin) =>
      coin.symbol.toLowerCase().includes(needle) ||
      coin.name.toLowerCase().includes(needle),
  )
}
