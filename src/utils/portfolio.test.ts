import { describe, expect, it } from 'vitest'
import { createInitialPortfolio } from '../store/portfolioSlice'
import { summarizePortfolio } from './portfolio'

describe('summarizePortfolio', () => {
  const portfolio = {
    ...createInitialPortfolio(),
    cashEur: 4_000,
    realizedPnlEur: 100,
    holdings: {
      BTC: { amount: 0.1, costEur: 5_000 },
      ETH: { amount: 1, costEur: 1_000 },
    },
  }

  it('values holdings at live prices and computes profit and loss', () => {
    const summary = summarizePortfolio(portfolio, {
      BTC: { symbol: 'BTC', price: 60_000, changePercent: 0 },
      ETH: { symbol: 'ETH', price: 900, changePercent: 0 },
    })

    expect(summary.holdingsValueEur).toBeCloseTo(6_900)
    expect(summary.totalValueEur).toBeCloseTo(10_900)
    expect(summary.unrealizedPnlEur).toBeCloseTo(900)
    expect(summary.totalPnlEur).toBeCloseTo(1_000)

    const [btc, eth] = summary.positions
    expect(btc).toMatchObject({ symbol: 'BTC', avgPriceEur: 50_000 })
    expect(btc.pnlEur).toBeCloseTo(1_000)
    expect(btc.pnlPercent).toBeCloseTo(20)
    expect(eth.pnlEur).toBeCloseTo(-100)
  })

  it('falls back to cost when a price is missing', () => {
    const summary = summarizePortfolio(portfolio, undefined)

    expect(summary.holdingsValueEur).toBe(6_000)
    expect(summary.unrealizedPnlEur).toBe(0)
    expect(summary.positions[0].pnlEur).toBeUndefined()
  })
})
