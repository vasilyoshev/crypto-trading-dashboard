import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('only publishes the value after it stops changing', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'b' },
    })

    rerender({ value: 'bt' })
    act(() => vi.advanceTimersByTime(200))
    rerender({ value: 'btc' })
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe('b')

    act(() => vi.advanceTimersByTime(100))
    expect(result.current).toBe('btc')
  })
})
