import { act, fireEvent, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mockBinance, renderWithStore } from '../test/utils'
import { MarketList, SEARCH_DEBOUNCE_MS } from './MarketList'

describe('MarketList', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('shows live prices for each coin', async () => {
    mockBinance()
    renderWithStore(<MarketList />)

    expect(await screen.findByText('50,000.00 €')).toBeInTheDocument()
    expect(screen.getByText('+2.50%')).toBeInTheDocument()
    expect(screen.getByText('-1.25%')).toBeInTheDocument()
  })

  it('filters coins only after the search input is debounced', () => {
    vi.useFakeTimers()
    mockBinance()
    renderWithStore(<MarketList />)

    fireEvent.change(screen.getByLabelText('Search coins'), { target: { value: 'eth' } })
    expect(screen.getByText('Bitcoin')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS))
    expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument()
    expect(screen.getByText('Ethereum')).toBeInTheDocument()
  })

  it('shows an empty state when nothing matches', () => {
    vi.useFakeTimers()
    mockBinance()
    renderWithStore(<MarketList />)

    fireEvent.change(screen.getByLabelText('Search coins'), { target: { value: 'zzz' } })
    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS))
    expect(screen.getByText(/No coins match/)).toBeInTheDocument()
  })

  it('selects a coin on click', () => {
    mockBinance()
    const { store } = renderWithStore(<MarketList />)

    fireEvent.click(screen.getByRole('button', { name: /ETH/ }))
    expect(store.getState().ui.selectedSymbol).toBe('ETH')
    expect(screen.getByRole('button', { name: /ETH/ })).toHaveAttribute('aria-pressed', 'true')
  })
})
