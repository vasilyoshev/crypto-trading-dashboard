# Crypto Trading Dashboard

A responsive web app for following live crypto prices and practicing trades with mock money.

- **Live price chart.** A line (area) chart shows the last 24 hours of prices for the selected coin, extended in real time with the latest price.
- **Mock trading.** Buy or sell with a 10,000 € starting balance. The portfolio updates immediately and no backend is involved.
- **Portfolio overview.** Holdings, average buy price, current value, unrealized and realized profit/loss, plus a full transaction history.
- **Real-time updates.** Prices refresh every 10 seconds and chart history every minute.
- **Markets list.** Twelve coins with EUR markets, filtered by a debounced search input.

The layout follows the provided mobile Figma design and adapts to tablet and desktop widths.

## Getting started

Requirements: [Node.js](https://nodejs.org/) 20.19+ or 22.12+ and npm.

```bash
git clone https://github.com/<your-account>/crypto-trading-dashboard.git
cd crypto-trading-dashboard
npm install
npm run dev
```

Then open http://localhost:5173.

No API key is needed. Prices come from Binance's public market-data endpoint (`data-api.binance.vision`).

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm test` | Run the unit tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint with oxlint |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run preview` | Serve the production build locally |

## Tech stack

| Concern | Choice |
| --- | --- |
| UI | React 19 with hooks, TypeScript, Vite |
| State | Redux Toolkit. Prices are fetched, cached and polled with RTK Query. The portfolio is a plain slice. |
| Charts | Recharts |
| Data | Binance public REST API (`/ticker/24hr` and `/klines`) |
| Styling | Plain CSS with custom properties |
| Tests | Vitest and React Testing Library |

## Project structure

```
src/
  api/binance.ts         Fetching and validating API responses
  config/coins.ts        Supported coins and search filtering
  store/
    marketApi.ts         RTK Query endpoints for prices and 24h history
    portfolioSlice.ts    Cash, holdings, trades and trade validation
    uiSlice.ts           Selected coin
    persistence.ts       Saves the portfolio to localStorage
  hooks/                 useDebounce and the polling price hooks
  utils/                 Formatting and portfolio profit/loss math
  components/            UI components (chart and trade dialog are lazy loaded)
```

## Implementation notes

- **Profit/loss** uses average cost. Selling reduces the cost basis proportionally, and the difference is recorded as realized profit/loss. Unrealized profit/loss is the holding's live value minus its remaining cost.
- **Error handling.** API responses are validated before they reach the store. Network failures, HTTP errors, rate limits, malformed JSON and invalid numbers become readable messages. If polling fails, the last known prices stay on screen with a banner and a Retry button. The chart has its own error state. Trading is disabled until a live price is available, and invalid trades show an inline error.
- **Performance.** The chart (Recharts) and the trade dialog are lazy loaded into separate chunks. The coin search is debounced by 300 ms. Polling pauses while the browser tab is hidden.
- **Persistence.** The mock portfolio is stored in `localStorage` so it survives a page reload. Use **Reset** in the portfolio panel to start over.
