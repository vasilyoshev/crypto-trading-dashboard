import { useAppSelector } from '../store/hooks'
import { formatCrypto, formatEur, formatTimestamp } from '../utils/format'

export function TransactionHistory() {
  const transactions = useAppSelector((state) => state.portfolio.transactions)

  return (
    <>
      <h2 className="panel__title">Transaction history</h2>
      {transactions.length === 0 ? (
        <p className="empty">No trades yet.</p>
      ) : (
        <ul className="history scroll-fill" aria-label="Transactions">
          {transactions.map((tx) => {
            const isBuy = tx.side === 'buy'
            return (
              <li key={tx.id} className="history__row">
                <span className={`history__side ${isBuy ? 'gain' : 'loss'}`}>{isBuy ? 'Buy' : 'Sell'}</span>
                <span className="history__amount">
                  {isBuy ? '+' : '-'}
                  {formatCrypto(tx.amount)} {tx.symbol} / {isBuy ? '-' : '+'}
                  {formatEur(tx.totalEur)}
                </span>
                <time dateTime={new Date(tx.timestamp).toISOString()}>{formatTimestamp(tx.timestamp)}</time>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
