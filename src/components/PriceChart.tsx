import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PricePoint } from '../api/binance'
import { HISTORY_POLL_MS } from '../hooks/useMarket'
import { getErrorMessage, useGetHistoryQuery } from '../store/marketApi'
import { formatHour, formatPrice, formatTime } from '../utils/format'

/** SVG attributes do not resolve CSS variables reliably, so chart colors live here. */
const COLORS = {
  line: '#1e7f7b',
  fill: '#3aa7a3',
  grid: '#e3e8eb',
  axis: '#6b7a86',
  avg: '#13293d',
}

interface Props {
  symbol: string
  livePrice?: number
  /** When livePrice was fetched. */
  livePriceTime?: number
  avgBuyPrice?: number
}

const axisPrice = (value: number) =>
  value >= 1000 ? Math.round(value).toLocaleString('en-US') : formatPrice(value).replace(' €', '')

export default function PriceChart({ symbol, livePrice, livePriceTime, avgBuyPrice }: Props) {
  const { data, error, isLoading, isFetching, refetch } = useGetHistoryQuery(symbol, {
    pollingInterval: HISTORY_POLL_MS,
  })

  // Extend the 5-minute history with the latest polled price so the chart moves in real time.
  const points = useMemo<PricePoint[]>(() => {
    if (!data) return []
    const last = data[data.length - 1]
    if (livePrice === undefined || livePriceTime === undefined || livePriceTime <= last.time) return data
    return [...data, { time: livePriceTime, price: livePrice }]
  }, [data, livePrice, livePriceTime])

  if (isLoading) {
    return <div className="chart chart--placeholder">Loading 24h chart…</div>
  }

  if (!data) {
    return (
      <div className="chart chart--placeholder" role="alert">
        <p>The price chart could not be loaded. {getErrorMessage(error)}</p>
        <button type="button" className="btn btn--small" onClick={() => refetch()} disabled={isFetching}>
          Retry
        </button>
      </div>
    )
  }

  const prices = points.map((p) => p.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const padding = (max - min) * 0.1 || max * 0.01
  const domain: [number, number] = [min - padding, max + padding]
  const lastPrice = prices[prices.length - 1]
  const showAvg = avgBuyPrice !== undefined && avgBuyPrice >= domain[0] && avgBuyPrice <= domain[1]

  return (
    <figure className="chart" aria-label={`${symbol} price over the last 24 hours`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 12, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.fill} stopOpacity={0.35} />
              <stop offset="100%" stopColor={COLORS.fill} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={COLORS.grid} strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={formatHour}
            minTickGap={48}
            tick={{ fontSize: 11, fill: COLORS.axis }}
            stroke={COLORS.grid}
          />
          <YAxis
            orientation="right"
            domain={domain}
            tickFormatter={axisPrice}
            width={72}
            tick={{ fontSize: 11, fill: COLORS.axis }}
            stroke={COLORS.grid}
          />
          <Tooltip
            labelFormatter={(time) => formatTime(Number(time))}
            formatter={(value) => [formatPrice(Number(value)), symbol]}
          />
          {showAvg && (
            <ReferenceLine
              y={avgBuyPrice}
              stroke={COLORS.avg}
              strokeDasharray="4 4"
              label={{ value: 'Avg buy', position: 'insideTopLeft', fontSize: 11, fill: COLORS.avg }}
            />
          )}
          <ReferenceLine y={lastPrice} stroke={COLORS.fill} strokeDasharray="2 4" />
          <Area
            type="monotone"
            dataKey="price"
            stroke={COLORS.line}
            strokeWidth={1.5}
            fill="url(#priceFill)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      {error && <figcaption className="chart__stale">Chart may be outdated. {getErrorMessage(error)}</figcaption>}
    </figure>
  )
}
