import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { mockBinance, renderWithStore } from './test/utils'

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders live prices and the portfolio', async () => {
    mockBinance()
    renderWithStore(<App />)

    expect(await screen.findByText('50,000.00 €', { selector: '.summary__price' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Trade' })).toBeEnabled()
    expect(screen.getByText('Total value')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows an error with retry and disables trading when the API fails', async () => {
    mockBinance({ fail: true })
    renderWithStore(<App />)

    expect(await screen.findByText(/Prices could not be loaded/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Trade' })).toBeDisabled()
    // The chart is lazy loaded, so its chunk can take a moment to arrive.
    expect(
      await screen.findByText(/The price chart could not be loaded/, undefined, { timeout: 5_000 }),
    ).toBeInTheDocument()
  })
})
