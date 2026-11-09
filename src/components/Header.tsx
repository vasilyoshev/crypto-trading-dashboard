import { useSelectedSymbol } from '../hooks/useMarket'
import { useAppSelector } from '../store/hooks'
import { formatCrypto, formatEur } from '../utils/format'
import { Logo } from './Logo'

export function Header() {
  const symbol = useSelectedSymbol()
  const cashEur = useAppSelector((state) => state.portfolio.cashEur)
  const held = useAppSelector((state) => state.portfolio.holdings[symbol]?.amount ?? 0)

  return (
    <header className="header">
      <div className="brand">
        <Logo />
        <span className="brand__name">Crypto Trader</span>
      </div>
      <div className="balance" aria-label="Available balance">
        <span className="balance__label">Available</span>
        <span>
          {formatCrypto(held)} <strong>{symbol}</strong>
        </span>
        <span>{formatEur(cashEur)}</span>
      </div>
    </header>
  )
}
