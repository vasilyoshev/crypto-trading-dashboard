const twoDecimals = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const smallPrice = new Intl.NumberFormat('en-US', {
  minimumSignificantDigits: 2,
  maximumSignificantDigits: 4,
})
const cryptoAmount = new Intl.NumberFormat('en-US', { maximumFractionDigits: 8 })

const roundCents = (value: number) => Math.round(value * 100) / 100

function sign(value: number): string {
  return value > 0 ? '+' : value < 0 ? '-' : ''
}

export function formatEur(value: number): string {
  return `${twoDecimals.format(roundCents(value) || 0)} €`
}

/** Prices below 1 € need more precision than cents. */
export function formatPrice(value: number): string {
  return value >= 1 ? formatEur(value) : `${smallPrice.format(value)} €`
}

export function formatSignedEur(value: number): string {
  const rounded = roundCents(value)
  return `${sign(rounded)}${formatEur(Math.abs(rounded))}`
}

export function formatCrypto(value: number): string {
  return cryptoAmount.format(value)
}

export function formatPercent(value: number): string {
  const rounded = Math.round(value * 100) / 100
  return `${sign(rounded)}${Math.abs(rounded).toFixed(2)}%`
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-GB', { hour12: false })
}

export function formatHour(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

/** Time only for today, otherwise a short date and time. */
export function formatTimestamp(timestamp: number, now = Date.now()): string {
  const date = new Date(timestamp)
  if (date.toDateString() === new Date(now).toDateString()) return formatTime(timestamp)
  const day = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  return `${day} ${formatHour(timestamp)}`
}

/** Parses user input, accepting either "." or "," as decimal separator. */
export function parseAmount(input: string): number | null {
  const trimmed = input.trim().replace(',', '.')
  if (trimmed === '') return null
  const value = Number(trimmed)
  return Number.isFinite(value) && value >= 0 ? value : null
}

/** Fixed decimals without trailing zeros and without exponent notation. */
export function toInputValue(value: number, decimals: number): string {
  return value.toFixed(decimals).replace(/\.?0+$/, '')
}
