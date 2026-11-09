import { describe, expect, it } from 'vitest'
import reducer, {
  createInitialPortfolio,
  INITIAL_CASH_EUR,
  portfolioReset,
  tradeExecuted,
  validateTrade,
  type PortfolioState,
} from './portfolioSlice'

const buy = (amount: number, priceEur: number, symbol = 'BTC') =>
  tradeExecuted({ symbol, side: 'buy', amount, priceEur })
const sell = (amount: number, priceEur: number, symbol = 'BTC') =>
  tradeExecuted({ symbol, side: 'sell', amount, priceEur })

const run = (...actions: ReturnType<typeof tradeExecuted>[]): PortfolioState =>
  actions.reduce(reducer, createInitialPortfolio())

describe('portfolioSlice', () => {
  it('starts with the mock cash balance and no holdings', () => {
    expect(reducer(undefined, { type: 'init' })).toEqual({
      cashEur: INITIAL_CASH_EUR,
      holdings: {},
      transactions: [],
      realizedPnlEur: 0,
    })
  })

  it('buys: moves cash into a holding and records the transaction', () => {
    const state = run(buy(0.1, 50_000))

    expect(state.cashEur).toBe(5_000)
    expect(state.holdings.BTC).toEqual({ amount: 0.1, costEur: 5_000 })
    expect(state.transactions).toHaveLength(1)
    expect(state.transactions[0]).toMatchObject({ side: 'buy', symbol: 'BTC', totalEur: 5_000 })
  })

  it('tracks the average cost across several buys', () => {
    const state = run(buy(0.1, 40_000), buy(0.1, 60_000))

    expect(state.holdings.BTC.amount).toBeCloseTo(0.2)
    expect(state.holdings.BTC.costEur).toBeCloseTo(10_000)
  })

  it('sells: realizes profit against the average cost', () => {
    const state = run(buy(0.2, 50_000), sell(0.1, 60_000))

    expect(state.holdings.BTC.amount).toBeCloseTo(0.1)
    expect(state.holdings.BTC.costEur).toBeCloseTo(5_000)
    expect(state.cashEur).toBeCloseTo(INITIAL_CASH_EUR - 10_000 + 6_000)
    expect(state.realizedPnlEur).toBeCloseTo(1_000)
  })

  it('removes a holding when everything is sold', () => {
    const state = run(buy(0.1, 50_000), sell(0.1, 45_000))

    expect(state.holdings.BTC).toBeUndefined()
    expect(state.realizedPnlEur).toBeCloseTo(-500)
    expect(state.transactions.map((tx) => tx.side)).toEqual(['sell', 'buy'])
  })

  it('ignores trades that fail validation', () => {
    const initial = createInitialPortfolio()

    expect(reducer(initial, buy(1, 50_000))).toBe(initial)
    expect(reducer(initial, sell(0.1, 50_000))).toBe(initial)
  })

  it('resets to the initial portfolio', () => {
    const state = reducer(run(buy(0.1, 50_000)), portfolioReset())
    expect(state).toEqual(createInitialPortfolio())
  })
})

describe('validateTrade', () => {
  const state = run(buy(0.1, 50_000))

  it('accepts trades within the available balance', () => {
    expect(validateTrade(state, { symbol: 'BTC', side: 'buy', amount: 0.1, priceEur: 50_000 })).toBeNull()
    expect(validateTrade(state, { symbol: 'BTC', side: 'sell', amount: 0.1, priceEur: 50_000 })).toBeNull()
  })

  it('rejects zero, negative and non-numeric amounts', () => {
    for (const amount of [0, -1, Number.NaN]) {
      expect(validateTrade(state, { symbol: 'BTC', side: 'buy', amount, priceEur: 50_000 })).toMatch(
        /greater than zero/,
      )
    }
  })

  it('rejects buys above the cash balance', () => {
    expect(validateTrade(state, { symbol: 'BTC', side: 'buy', amount: 1, priceEur: 50_000 })).toMatch(
      /Insufficient funds/,
    )
  })

  it('rejects sells above the holding', () => {
    expect(validateTrade(state, { symbol: 'ETH', side: 'sell', amount: 1, priceEur: 2_000 })).toMatch(
      /Insufficient ETH/,
    )
  })

  it('rejects trades without a valid price', () => {
    expect(validateTrade(state, { symbol: 'BTC', side: 'buy', amount: 0.1, priceEur: 0 })).toMatch(
      /price is unavailable/,
    )
  })
})
