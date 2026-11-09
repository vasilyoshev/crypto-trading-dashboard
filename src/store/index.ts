import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { marketApi } from './marketApi'
import { loadPortfolio, savePortfolio } from './persistence'
import portfolioReducer from './portfolioSlice'
import uiReducer from './uiSlice'

const rootReducer = combineReducers({
  portfolio: portfolioReducer,
  ui: uiReducer,
  [marketApi.reducerPath]: marketApi.reducer,
})

export type RootState = ReturnType<typeof rootReducer>

export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(marketApi.middleware),
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type AppDispatch = AppStore['dispatch']

/** Store for the running app: restores the portfolio and saves it on every change. */
export function createAppStore(): AppStore {
  const portfolio = loadPortfolio()
  const store = makeStore(portfolio ? { portfolio } : undefined)

  // Lets RTK Query pause polling while the tab is hidden and resume on focus.
  setupListeners(store.dispatch)

  let saved = store.getState().portfolio
  store.subscribe(() => {
    const current = store.getState().portfolio
    if (current !== saved) {
      saved = current
      savePortfolio(current)
    }
  })
  return store
}
