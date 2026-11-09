import { useMemo, useState } from 'react'
import { COINS, filterCoins } from '../config/coins'
import { useDebounce } from '../hooks/useDebounce'
import { useSelectedSymbol, useTickers } from '../hooks/useMarket'
import { useAppDispatch } from '../store/hooks'
import { coinSelected } from '../store/uiSlice'
import { formatPercent, formatPrice } from '../utils/format'

export const SEARCH_DEBOUNCE_MS = 300

export function MarketList() {
  const dispatch = useAppDispatch()
  const selected = useSelectedSymbol()
  const { data: tickers } = useTickers()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS)

  const coins = useMemo(() => filterCoins(COINS, debouncedQuery), [debouncedQuery])

  return (
    <>
      <h2 className="panel__title">Markets</h2>
      <input
        type="search"
        className="search"
        placeholder="Search coins…"
        aria-label="Search coins"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <ul className="coin-list scroll-fill">
        {coins.map((coin) => {
          const ticker = tickers?.[coin.symbol]
          const isSelected = coin.symbol === selected
          return (
            <li key={coin.symbol}>
              <button
                type="button"
                className={`coin${isSelected ? ' coin--selected' : ''}`}
                aria-pressed={isSelected}
                onClick={() => dispatch(coinSelected(coin.symbol))}
              >
                <span className="coin__name">
                  <strong>{coin.symbol}</strong>
                  <small>{coin.name}</small>
                </span>
                <span className="coin__price">
                  {ticker ? formatPrice(ticker.price) : '—'}
                  {ticker && (
                    <small className={ticker.changePercent >= 0 ? 'gain' : 'loss'}>
                      {formatPercent(ticker.changePercent)}
                    </small>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      {coins.length === 0 && <p className="empty">No coins match “{debouncedQuery}”.</p>}
    </>
  )
}
