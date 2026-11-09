import type { TickerMap } from '../api/binance'
import type { Holding, PortfolioState } from '../store/portfolioSlice'

export interface Position {
  symbol: string
  amount: number
  costEur: number
  avgPriceEur: number
  /** The fields below are undefined when no live price is known. */
  priceEur?: number
  valueEur?: number
  pnlEur?: number
  pnlPercent?: number
}

export interface PortfolioSummary {
  positions: Position[]
  holdingsValueEur: number
  totalValueEur: number
  unrealizedPnlEur: number
  realizedPnlEur: number
  totalPnlEur: number
}

export function getPosition(symbol: string, holding: Holding, priceEur?: number): Position {
  const position: Position = {
    symbol,
    amount: holding.amount,
    costEur: holding.costEur,
    avgPriceEur: holding.costEur / holding.amount,
  }
  if (priceEur === undefined) return position

  const valueEur = holding.amount * priceEur
  const pnlEur = valueEur - holding.costEur
  return {
    ...position,
    priceEur,
    valueEur,
    pnlEur,
    pnlPercent: holding.costEur > 0 ? (pnlEur / holding.costEur) * 100 : 0,
  }
}

/** Values holdings at live prices. Coins without a known price are valued at cost. */
export function summarizePortfolio(
  portfolio: PortfolioState,
  tickers: TickerMap | undefined,
): PortfolioSummary {
  const positions = Object.entries(portfolio.holdings).map(([symbol, holding]) =>
    getPosition(symbol, holding, tickers?.[symbol]?.price),
  )
  const valueOf = (p: Position) => p.valueEur ?? p.costEur

  const holdingsValueEur = positions.reduce((sum, p) => sum + valueOf(p), 0)
  const unrealizedPnlEur = positions.reduce((sum, p) => sum + (p.pnlEur ?? 0), 0)

  return {
    positions: positions.sort((a, b) => valueOf(b) - valueOf(a)),
    holdingsValueEur,
    totalValueEur: portfolio.cashEur + holdingsValueEur,
    unrealizedPnlEur,
    realizedPnlEur: portfolio.realizedPnlEur,
    totalPnlEur: unrealizedPnlEur + portfolio.realizedPnlEur,
  }
}
