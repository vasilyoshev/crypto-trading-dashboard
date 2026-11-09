import { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { tradeExecuted, validateTrade, type TradeSide } from '../store/portfolioSlice'
import { formatCrypto, formatEur, formatPrice, parseAmount, toInputValue } from '../utils/format'

interface Props {
  symbol: string
  priceEur: number
  onClose: () => void
}

type Field = 'eur' | 'coin'

/** Buy/sell dialog. The EUR and coin fields stay in sync at the live price. */
export default function TradeModal({ symbol, priceEur, onClose }: Props) {
  const dispatch = useAppDispatch()
  const portfolio = useAppSelector((state) => state.portfolio)
  const held = portfolio.holdings[symbol]?.amount ?? 0

  const [eurValue, setEurValue] = useState('')
  const [coinValue, setCoinValue] = useState('')
  const [lastEdited, setLastEdited] = useState<Field>('eur')
  const [error, setError] = useState<string | null>(null)
  const eurInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    eurInput.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const changeEur = (value: string) => {
    const eur = parseAmount(value)
    setEurValue(value)
    setCoinValue(eur === null ? '' : toInputValue(eur / priceEur, 8))
    setLastEdited('eur')
    setError(null)
  }

  const changeCoin = (value: string) => {
    const amount = parseAmount(value)
    setCoinValue(value)
    setEurValue(amount === null ? '' : toInputValue(amount * priceEur, 2))
    setLastEdited('coin')
    setError(null)
  }

  const submit = (side: TradeSide) => {
    // Use the field the user typed in, so rounding in the other field never changes the trade.
    const amount =
      lastEdited === 'coin'
        ? (parseAmount(coinValue) ?? Number.NaN)
        : (parseAmount(eurValue) ?? Number.NaN) / priceEur
    const trade = { symbol, side, amount, priceEur }

    const validationError = validateTrade(portfolio, trade)
    if (validationError) {
      setError(validationError)
      return
    }
    dispatch(tradeExecuted(trade))
    onClose()
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="trade-title">
        <div className="modal__header">
          <h2 id="trade-title">Trade {symbol}</h2>
          <button type="button" className="icon-button" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <p className="modal__rate">
          1 {symbol} = {formatPrice(priceEur)}
        </p>

        <label className="field">
          <input
            ref={eurInput}
            inputMode="decimal"
            placeholder="0.00"
            aria-label="Amount in EUR"
            value={eurValue}
            onChange={(event) => changeEur(event.target.value)}
          />
          <span className="field__unit">EUR</span>
        </label>
        <button type="button" className="link-button" onClick={() => changeEur(toInputValue(portfolio.cashEur, 2))}>
          Available: {formatEur(portfolio.cashEur)}
        </button>

        <label className="field">
          <input
            inputMode="decimal"
            placeholder="0.00000000"
            aria-label={`Amount in ${symbol}`}
            value={coinValue}
            onChange={(event) => changeCoin(event.target.value)}
          />
          <span className="field__unit">{symbol}</span>
        </label>
        <button type="button" className="link-button" onClick={() => changeCoin(toInputValue(held, 8))}>
          Holding: {formatCrypto(held)} {symbol}
        </button>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="modal__actions">
          <button type="button" className="btn btn--buy" onClick={() => submit('buy')}>
            Buy
          </button>
          <button type="button" className="btn btn--sell" onClick={() => submit('sell')}>
            Sell
          </button>
        </div>
      </div>
    </div>
  )
}
