import { useTickers } from '../hooks/useMarket'
import { getErrorMessage } from '../store/marketApi'

/** Shown when live prices fail to load. Keeps the last known prices on screen. */
export function ErrorBanner() {
  const { isError, error, data, refetch, isFetching } = useTickers()
  if (!isError) return null

  const message = getErrorMessage(error)
  return (
    <div className="banner" role="alert">
      <span>
        {data
          ? `Live prices could not be updated. Showing the last known prices. ${message}`
          : `Prices could not be loaded. ${message}`}
      </span>
      <button type="button" className="btn btn--small" onClick={() => refetch()} disabled={isFetching}>
        {isFetching ? 'Retrying…' : 'Retry'}
      </button>
    </div>
  )
}
