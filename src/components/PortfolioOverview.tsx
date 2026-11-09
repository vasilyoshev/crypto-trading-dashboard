import { useMemo } from 'react'
import { useTickers } from '../hooks/useMarket'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { INITIAL_CASH_EUR, portfolioReset } from '../store/portfolioSlice'
import { coinSelected } from '../store/uiSlice'
import { formatCrypto, formatEur, formatPercent, formatPrice, formatSignedEur } from '../utils/format'
import { summarizePortfolio } from '../utils/portfolio'

const trendClass = (value: number) => (value >= 0 ? 'gain' : 'loss')

export function PortfolioOverview() {
  const dispatch = useAppDispatch()
  const portfolio = useAppSelector((state) => state.portfolio)
  const { data: tickers } = useTickers()
  const summary = useMemo(() => summarizePortfolio(portfolio, tickers), [portfolio, tickers])

  const reset = () => {
    if (window.confirm(`Reset the portfolio to ${formatEur(INITIAL_CASH_EUR)}? All trades will be cleared.`)) {
      dispatch(portfolioReset())
    }
  }

  return (
    <>
      <div className="panel__heading">
        <h2 className="panel__title">Portfolio</h2>
        <button type="button" className="link-button" onClick={reset}>
          Reset
        </button>
      </div>

      <dl className="stats">
        <div>
          <dt>Total value</dt>
          <dd>{formatEur(summary.totalValueEur)}</dd>
        </div>
        <div>
          <dt>Cash</dt>
          <dd>{formatEur(portfolio.cashEur)}</dd>
        </div>
        <div>
          <dt>Unrealized PnL</dt>
          <dd className={trendClass(summary.unrealizedPnlEur)}>{formatSignedEur(summary.unrealizedPnlEur)}</dd>
        </div>
        <div>
          <dt>Total PnL</dt>
          <dd className={trendClass(summary.totalPnlEur)}>{formatSignedEur(summary.totalPnlEur)}</dd>
        </div>
      </dl>

      {summary.positions.length === 0 ? (
        <p className="empty">You don’t hold any crypto yet. Select a coin and press Trade to buy some.</p>
      ) : (
        <div className="table-wrap">
          <table className="holdings">
            <thead>
              <tr>
                <th scope="col">Coin</th>
                <th scope="col">Amount</th>
                <th scope="col">Avg buy</th>
                <th scope="col">Value</th>
                <th scope="col">PnL</th>
              </tr>
            </thead>
            <tbody>
              {summary.positions.map((position) => (
                <tr key={position.symbol} onClick={() => dispatch(coinSelected(position.symbol))}>
                  <th scope="row">{position.symbol}</th>
                  <td>{formatCrypto(position.amount)}</td>
                  <td>{formatPrice(position.avgPriceEur)}</td>
                  <td>{position.valueEur === undefined ? '—' : formatEur(position.valueEur)}</td>
                  <td>
                    {position.pnlEur === undefined || position.pnlPercent === undefined ? (
                      '—'
                    ) : (
                      <span className={trendClass(position.pnlEur)}>
                        {formatSignedEur(position.pnlEur)}
                        <small>{formatPercent(position.pnlPercent)}</small>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
