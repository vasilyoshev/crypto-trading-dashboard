import { ErrorBanner } from './components/ErrorBanner'
import { Header } from './components/Header'
import { MarketList } from './components/MarketList'
import { PortfolioOverview } from './components/PortfolioOverview'
import { TradingPanel } from './components/TradingPanel'
import { TransactionHistory } from './components/TransactionHistory'

export default function App() {
  return (
    <div className="app">
      <Header />
      <ErrorBanner />
      <main className="layout">
        <section className="panel panel--markets" aria-label="Markets">
          <MarketList />
        </section>
        <section className="panel panel--trading" aria-label="Price chart and trading">
          <TradingPanel />
        </section>
        <section className="panel panel--portfolio" aria-label="Portfolio">
          <PortfolioOverview />
        </section>
        <section className="panel panel--history" aria-label="Transaction history">
          <TransactionHistory />
        </section>
      </main>
    </div>
  )
}
