export default {
  // CONSTS cuz im lazzy
  baseApiUrl: `https://web3api.io/api/v2/`,

  // Settings
  apiKey: null,
  authenticated: false,
  wsActive: false,
  settingsPanelActive: false,
  tradesActive: false,
  tickersActive: false,
  exchangesActive: true,
  ohlcvActive: false,
  orderEventsActive: false,
  orderSnapshotsActive: true,
  vwapActive: false,

  // External data
  asset: { pair: 'btc_usd' },
  assetExchanges: ["bitfinex", "bitstamp", "gdax", "gemini", "kraken", "ftx"],
  price: {},
  trades: [],
  tickers: {},
  exchanges: {},
  ohlcv: [],
  orderbook: {},
  orderbookBucketed: {},
  vwap: [],
}