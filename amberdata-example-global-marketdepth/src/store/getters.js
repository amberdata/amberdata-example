export default {
  // CONSTS cuz im lazzy
  baseApiUrl: state => state.baseApiUrl,

  // Settings
  apiKey: state => state.apiKey,
  authenticated: state => state.authenticated,
  wsActive: state => state.wsActive,
  settingsPanelActive: state => state.settingsPanelActive,
  tradesActive: state => state.tradesActive,
  tickersActive: state => state.tickersActive,
  exchangesActive: state => state.exchangesActive,
  ohlcvActive: state => state.ohlcvActive,
  vwapActive: state => state.vwapActive,
  orderEventsActive: state => state.orderEventsActive,
  orderSnapshotsActive: state => state.orderSnapshotsActive,

  // External data
  asset: state => state.asset,
  price: state => state.price,
  trades: state => state.trades,
  tickers: state => state.tickers,
  exchanges: state => state.exchanges,
  ohlcv: state => state.ohlcv,
  vwap: state => state.vwap,
  orderEvents: state => state.orderEvents,
  orderSnapshots: state => state.orderSnapshots,
}
