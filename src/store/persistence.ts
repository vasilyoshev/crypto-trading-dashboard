import type { PortfolioState } from './portfolioSlice'

const STORAGE_KEY = 'crypto-dashboard/portfolio'

function isPortfolioState(value: unknown): value is PortfolioState {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    Number.isFinite(candidate.cashEur) &&
    Number.isFinite(candidate.realizedPnlEur) &&
    typeof candidate.holdings === 'object' &&
    candidate.holdings !== null &&
    Array.isArray(candidate.transactions)
  )
}

/** Returns the saved portfolio, or undefined when it is missing or corrupted. */
export function loadPortfolio(): PortfolioState | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    const parsed: unknown = JSON.parse(raw)
    return isPortfolioState(parsed) ? parsed : undefined
  } catch {
    return undefined
  }
}

export function savePortfolio(portfolio: PortfolioState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio))
  } catch {
    // Storage can be full or blocked. The app keeps working in memory.
  }
}
