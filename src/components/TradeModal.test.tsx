import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createInitialPortfolio } from '../store/portfolioSlice'
import { renderWithStore } from '../test/utils'
import TradeModal from './TradeModal'

const PRICE = 50_000

function setup(portfolio = createInitialPortfolio()) {
  const onClose = vi.fn()
  const result = renderWithStore(<TradeModal symbol="BTC" priceEur={PRICE} onClose={onClose} />, {
    preloadedState: { portfolio },
  })
  return { ...result, onClose, user: userEvent.setup() }
}

describe('TradeModal', () => {
  it('keeps the EUR and coin amounts in sync', async () => {
    const { user } = setup()

    await user.type(screen.getByLabelText('Amount in EUR'), '1000')
    expect(screen.getByLabelText('Amount in BTC')).toHaveValue('0.02')

    await user.clear(screen.getByLabelText('Amount in BTC'))
    await user.type(screen.getByLabelText('Amount in BTC'), '0.5')
    expect(screen.getByLabelText('Amount in EUR')).toHaveValue('25000')
  })

  it('buys and updates the portfolio immediately', async () => {
    const { user, store, onClose } = setup()

    await user.type(screen.getByLabelText('Amount in EUR'), '1000')
    await user.click(screen.getByRole('button', { name: 'Buy' }))

    const { portfolio } = store.getState()
    expect(portfolio.cashEur).toBeCloseTo(9_000)
    expect(portfolio.holdings.BTC.amount).toBeCloseTo(0.02)
    expect(portfolio.transactions[0]).toMatchObject({ side: 'buy', priceEur: PRICE })
    expect(onClose).toHaveBeenCalled()
  })

  it('sells the full holding using the shortcut', async () => {
    const { user, store } = setup({
      ...createInitialPortfolio(),
      holdings: { BTC: { amount: 0.1, costEur: 4_000 } },
    })

    await user.click(screen.getByRole('button', { name: /Holding: 0.1 BTC/ }))
    await user.click(screen.getByRole('button', { name: 'Sell' }))

    const { portfolio } = store.getState()
    expect(portfolio.holdings.BTC).toBeUndefined()
    expect(portfolio.cashEur).toBeCloseTo(15_000)
    expect(portfolio.realizedPnlEur).toBeCloseTo(1_000)
  })

  it('shows an error and keeps the dialog open when funds are insufficient', async () => {
    const { user, store, onClose } = setup()

    await user.type(screen.getByLabelText('Amount in EUR'), '20000')
    await user.click(screen.getByRole('button', { name: 'Buy' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Insufficient funds')
    expect(store.getState().portfolio.transactions).toHaveLength(0)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('rejects an empty amount', async () => {
    const { user } = setup()

    await user.click(screen.getByRole('button', { name: 'Sell' }))
    expect(screen.getByRole('alert')).toHaveTextContent('greater than zero')
  })

  it('closes with Escape', async () => {
    const { user, onClose } = setup()

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })
})
