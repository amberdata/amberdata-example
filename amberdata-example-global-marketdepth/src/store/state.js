export default {
  // CONSTS cuz im lazzy
  baseApiUrl: `https://web3api.io/api/v2/`,

  // Settings
  apiKey: null,
  authenticated: false,
  wsActive: false,
  settingsPanelActive: false,
  tradesActive: false,
  exchangesActive: true,
  ohlcvActive: false,
  vwapActive: false,
  orderEventsActive: false,
  orderSnapshotsActive: false,

  // External data
  asset: { pair: 'btc_usd' },
  price: {},
  trades: [],
  exchanges: [],
  ohlcv: [],
  vwap: [],
  orderEvents: {},
  orderSnapshots: {},
}
