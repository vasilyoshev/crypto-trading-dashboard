import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createInitialPortfolio, type Transaction } from '../store/portfolioSlice'
import { renderWithStore } from '../test/utils'
import { TransactionHistory } from './TransactionHistory'

describe('TransactionHistory', () => {
  it('shows an empty state without trades', () => {
    renderWithStore(<TransactionHistory />)
    expect(screen.getByText('No trades yet.')).toBeInTheDocument()
  })

  it('lists buys and sells with signed amounts', () => {
    const now = Date.now()
    const transactions: Transaction[] = [
      { id: '2', symbol: 'BTC', side: 'sell', amount: 0.01, priceEur: 50_000, totalEur: 500, timestamp: now },
      { id: '1', symbol: 'ETH', side: 'buy', amount: 0.5, priceEur: 2_000, totalEur: 1_000, timestamp: now },
    ]
    renderWithStore(<TransactionHistory />, {
      preloadedState: { portfolio: { ...createInitialPortfolio(), transactions } },
    })

    const rows = screen.getAllByRole('listitem')
    expect(rows).toHaveLength(2)
    expect(rows[0]).toHaveTextContent('Sell-0.01 BTC / +500.00 €')
    expect(rows[1]).toHaveTextContent('Buy+0.5 ETH / -1,000.00 €')
  })
})
