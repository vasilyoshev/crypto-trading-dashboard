import type { Ticker } from '../api/binance'
import { getCoinName } from '../config/coins'
import type { Position } from '../utils/portfolio'
import { formatPercent, formatPrice, formatSignedEur } from '../utils/format'

interface Props {
  symbol: string
  ticker?: Ticker
  position?: Position
}

const trendClass = (value: number) => (value >= 0 ? 'gain' : 'loss')

export function PriceSummary({ symbol, ticker, position }: Props) {
  return (
    <div className="summary">
      <h1 className="summary__symbol" title={getCoinName(symbol)}>
        {symbol}
      </h1>
      <p className="summary__price" aria-live="polite">
        {ticker ? formatPrice(ticker.price) : '—'}
      </p>
      <p className="summary__meta">
        {ticker && (
          <span>
            24h: <span className={trendClass(ticker.changePercent)}>{formatPercent(ticker.changePercent)}</span>
          </span>
        )}
        {position?.pnlEur !== undefined && (
          <span>
            PnL: <span className={trendClass(position.pnlEur)}>{formatSignedEur(position.pnlEur)}</span>
          </span>
        )}
      </p>
    </div>
  )
}
