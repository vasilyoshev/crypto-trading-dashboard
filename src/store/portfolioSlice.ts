import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import { formatCrypto, formatEur } from '../utils/format'

export const INITIAL_CASH_EUR = 10_000

/** Tolerances that absorb floating point noise. */
const AMOUNT_EPSILON = 1e-9
const CASH_EPSILON = 0.005

export type TradeSide = 'buy' | 'sell'

export interface Holding {
  amount: number
  /** Total EUR paid for the amount currently held (average cost basis). */
  costEur: number
}

export interface TradeRequest {
  symbol: string
  side: TradeSide
  amount: number
  priceEur: number
}

export interface Transaction extends TradeRequest {
  id: string
  totalEur: number
  timestamp: number
}

export interface PortfolioState {
  cashEur: number
  holdings: Record<string, Holding>
  /** Newest first. */
  transactions: Transaction[]
  realizedPnlEur: number
}

export const createInitialPortfolio = (): PortfolioState => ({
  cashEur: INITIAL_CASH_EUR,
  holdings: {},
  transactions: [],
  realizedPnlEur: 0,
})

/** Returns a user-facing error message, or null when the trade is allowed. */
export function validateTrade(state: PortfolioState, trade: TradeRequest): string | null {
  const { symbol, side, amount, priceEur } = trade
  if (!Number.isFinite(priceEur) || priceEur <= 0) {
    return 'The live price is unavailable. Please try again shortly.'
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Enter an amount greater than zero.'
  }
  if (side === 'buy' && amount * priceEur > state.cashEur + CASH_EPSILON) {
    return `Insufficient funds. You have ${formatEur(state.cashEur)} available.`
  }
  if (side === 'sell') {
    const held = state.holdings[symbol]?.amount ?? 0
    if (amount > held + AMOUNT_EPSILON) {
      return `Insufficient ${symbol}. You hold ${formatCrypto(held)} ${symbol}.`
    }
  }
  return null
}

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState: createInitialPortfolio,
  reducers: {
    tradeExecuted: {
      reducer(state, action: PayloadAction<Transaction>) {
        const trade = action.payload
        if (validateTrade(state, trade)) return

        const holding = state.holdings[trade.symbol] ?? { amount: 0, costEur: 0 }

        if (trade.side === 'buy') {
          holding.amount += trade.amount
          holding.costEur += trade.totalEur
          state.cashEur = Math.max(0, state.cashEur - trade.totalEur)
        } else {
          const amount = Math.min(trade.amount, holding.amount)
          const costOfSold = holding.costEur * (amount / holding.amount)
          holding.amount -= amount
          holding.costEur -= costOfSold
          state.cashEur += trade.totalEur
          state.realizedPnlEur += trade.totalEur - costOfSold
        }

        if (holding.amount <= AMOUNT_EPSILON) {
          delete state.holdings[trade.symbol]
        } else {
          state.holdings[trade.symbol] = holding
        }
        state.transactions.unshift(trade)
      },
      prepare(trade: TradeRequest) {
        return {
          payload: {
            ...trade,
            id: nanoid(),
            totalEur: trade.amount * trade.priceEur,
            timestamp: Date.now(),
          },
        }
      },
    },
    portfolioReset: () => createInitialPortfolio(),
  },
})

export const { tradeExecuted, portfolioReset } = portfolioSlice.actions
export default portfolioSlice.reducer
