export default {
  // CONSTS cuz im lazzy
  baseApiUrl: `https://web3api.io/api/v2/`,

  // Settings
  apiKey: null,
  authenticated: false,
  wsActive: false,
  settingsPanelActive: false,
  tradesActive: true,
  tickersActive: false,
  exchangesActive: true,
  ohlcvActive: false,
  orderEventsActive: false,
  orderSnapshotsActive: false,
  vwapActive: false,

  // External data
  asset: { pair: 'btc_usd' },
  price: {},
  trades: [],
  tickers: {},
  exchanges: {},
  ohlcv: [],
  orderEvents: {},
  orderSnapshots: {},
  vwap: [],
}