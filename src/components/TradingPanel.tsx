import { lazy, Suspense, useCallback, useState } from 'react'
import { useSelectedSymbol, useTickers } from '../hooks/useMarket'
import { useAppSelector } from '../store/hooks'
import { getPosition } from '../utils/portfolio'
import { ErrorBoundary } from './ErrorBoundary'
import { PriceSummary } from './PriceSummary'

// Recharts and the trade dialog are split into separate chunks and loaded on demand.
const PriceChart = lazy(() => import('./PriceChart'))
const TradeModal = lazy(() => import('./TradeModal'))

export function TradingPanel() {
  const symbol = useSelectedSymbol()
  const { data: tickers, fulfilledTimeStamp } = useTickers()
  const holding = useAppSelector((state) => state.portfolio.holdings[symbol])
  const [isTradeOpen, setTradeOpen] = useState(false)
  const closeTrade = useCallback(() => setTradeOpen(false), [])

  const ticker = tickers?.[symbol]
  const position = holding ? getPosition(symbol, holding, ticker?.price) : undefined

  return (
    <>
      <PriceSummary symbol={symbol} ticker={ticker} position={position} />

      <ErrorBoundary fallback={<div className="chart chart--placeholder">The chart failed to load.</div>}>
        <Suspense fallback={<div className="chart chart--placeholder">Loading 24h chart…</div>}>
          <PriceChart
            symbol={symbol}
            livePrice={ticker?.price}
            livePriceTime={fulfilledTimeStamp}
            avgBuyPrice={position?.avgPriceEur}
          />
        </Suspense>
      </ErrorBoundary>

      <button
        type="button"
        className="btn btn--primary btn--block"
        onClick={() => setTradeOpen(true)}
        disabled={!ticker}
        title={ticker ? undefined : 'Trading is available once the live price has loaded'}
      >
        Trade
      </button>

      {isTradeOpen && ticker && (
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <TradeModal symbol={symbol} priceEur={ticker.price} onClose={closeTrade} />
          </Suspense>
        </ErrorBoundary>
      )}
    </>
  )
}
