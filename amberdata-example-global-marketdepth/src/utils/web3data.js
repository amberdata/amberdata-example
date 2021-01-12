import state from "../store/state";
import { OrderBook } from "./orderbook";

const WEBSOCKET_SERVER_URL = 'wss://ws.web3api.io';

class Websockets {
  constructor() {
    this.store = null;
    this.OrderBookClass = null;
    this.websocket = null;
    this.subscriptions = {};
    this.orderbooks = {};
    this.tmpOrderbooks = {};

    // The default set
    this.objects = {
      price: { name: 'price', args: ["market:prices:updates", { pair: "btc_usd" }], subscription: null, object: null },
    };

    this.reset()
    return this
  }

  _addSubscription(data) {
    const subscription = data.result;
    if (subscription === true || subscription === false) return false;

    const id = data.id;
    this.objects[id].subscription = subscription;
    this.subscriptions[subscription] = id;
  }

  _subscribe(id, args) {
    if (!this.websocket) return;
    this.websocket.send(JSON.stringify({
      jsonrpc: '2.0',
      id,
      method: 'subscribe',
      params: [...args],
    }));
  }

  _subscribeAll() {
    Object.keys(this.objects).forEach(id => {
      this._subscribe(id, this.objects[id].args);
    })
  }

  _unsubscribe(id) {
    if (!this.websocket) return;
    this.websocket.send(
      JSON.stringify({
        jsonrpc: '2.0',
        method: 'unsubscribe',
        params: [this.objects[id].subscription],
        id,
      }),
    )
  }

  reset(key) {
    const apiKey = key || window.localStorage.apiKey;
    this.websocket = new WebSocket(`${WEBSOCKET_SERVER_URL}?x-api-key=${apiKey}`);

    this.websocket.addEventListener('message', this.messageHandler.bind(this));
    this.websocket.addEventListener('open', this._subscribeAll.bind(this));
    this.websocket.addEventListener('close', () => {
      this.reset(window.localStorage.apiKey);
    });

    return this;
  }

  messageHandler(message) {
    // Parse message data
    if (!message.data) return;
    const data = JSON.parse(message.data);

    // Check for subscription initialization messages
    if (data.id && data.result && this.objects[data.id]) {
      this._addSubscription(data)
    }

    // Check for subscription messages = new data
    if (data.method && data.method === 'subscription' && data.params && data.params.result && data.params.subscription) {
      const res = data.params.result;
      const subscription = data.params.subscription;

      if (this.subscriptions[subscription] && this.store) {
        const key = this.objects[this.subscriptions[subscription]].name;
        // console.log(key);
        const lag = 30 * 1000;
        const now = +new Date() - lag;
        let value = res
        let subKey

        switch (key) {
          case 'price':
            document.title = `${parseFloat(value.price).toFixed(2)} BTC_USD | Global Digital Asset Markets - by Amberdata.io`;
            this.store.dispatch('update', { key, value })
            break;
          case 'trades':
            const item = res[0]
            if (!(now > +new Date(item[2]))) {
              // all trades
              // Trade event data ordering is diff than REST
              const trade = [item[0], item[2], item[3], item[7], parseFloat(item[5]).toFixed(2), parseFloat(item[6]).toFixed(8), item[4]]
              this.store.dispatch('pushItem', { key, value: trade })
              // update per-exchange
              this.store.dispatch('addExchangePrice', { exchange: trade[0], price: parseFloat(trade[4]).toFixed(2), timestamp: trade[1] })
              // update global price value
              this.store.dispatch('addSubItem', { key: 'price', subKey: 'price', value: parseFloat(trade[4]).toFixed(2) })
            }
            break;
          case 'events':
            return;
            if (res && res.length) {
              res.forEach(i => {
                // double check the exchange orderbook is available
                this.orderbooks[i[0]] = this.orderbooks[i[0]] || new this.OrderBookClass()
                this.orderbooks[i[0]].addPoint(i)
              })
            }

            // Get all orderbooks and combine
            const combinedOrderbook = new this.OrderBookClass()
            Object.keys(this.orderbooks).forEach(exchange => {
              const exOb = this.orderbooks[exchange]
              exOb.bidsRaw.forEach(e => {
                combinedOrderbook.addPoint(e, true)
              })
              exOb.asksRaw.forEach(e => {
                combinedOrderbook.addPoint(e, true)
              })
            })

            // TODO: Debounce this, or people will have browser diessssss
            // update all data outlets
            // this.store.dispatch('update', { key: 'orderbook', value: combinedOrderbook.getOrderbook() })
            // this.store.dispatch('update', { key: 'orderbookBucketed', value: combinedOrderbook.getOrderbookBucketed() })
            break;
          case 'snapshots':
            // TODO: Figure out if the bids/asks are independent or if they are closely triggered.
            // - Reset each exchange orderbook individually (initializePoints)
            // - only reset each exchange snapshot IF the this.currentSnapshotTimestamp is diff than sent TS
            if (res && res.length) {
              let exchange
              const bids = []
              const asks = []
              res.forEach(i => {
                if (i && i[6] === true) bids.push(i)
                else asks.push(i)
              })
              // { bids, asks }, 
              console.log('snapshots { bids, asks }', bids[0], asks[0]);

              // const ob = new this.OrderBookClass().initializePoints({ bids, asks });
              // console.log('OHderBook', ob.getOrderbook());

              // If is new snapshot timestamp, wipe out exchange and start a fresh!
              if (bids.length > 0 && bids[0].length > 0) {
                exchange = bids[0][0]
                if (
                  (this.tmpOrderbooks[exchange] && this.tmpOrderbooks[exchange].timestamp && bids[0][2] > this.tmpOrderbooks[exchange].timestamp) ||
                  (!this.tmpOrderbooks[exchange] || !this.tmpOrderbooks[exchange].timestamp)
                ) {
                  this.tmpOrderbooks[exchange] = {};
                  this.tmpOrderbooks[exchange].timestamp = bids[0][2];
                  this.tmpOrderbooks[exchange].bids = bids;
                } else if (this.tmpOrderbooks[exchange] && this.tmpOrderbooks[exchange].timestamp && bids[0][2] === this.tmpOrderbooks[exchange].timestamp) {
                  this.tmpOrderbooks[exchange].bids = bids;
                }
              }
              if (asks.length > 0 && asks[0].length > 0) {
                exchange = asks[0][0]
                if (
                  (this.tmpOrderbooks[exchange] && this.tmpOrderbooks[exchange].timestamp && asks[0][2] > this.tmpOrderbooks[exchange].timestamp) ||
                  (!this.tmpOrderbooks[exchange] || !this.tmpOrderbooks[exchange].timestamp)
                ) {
                  this.tmpOrderbooks[exchange] = {};
                  this.tmpOrderbooks[exchange].timestamp = asks[0][2];
                  this.tmpOrderbooks[exchange].asks = asks;
                } else if (this.tmpOrderbooks[exchange] && this.tmpOrderbooks[exchange].timestamp && asks[0][2] === this.tmpOrderbooks[exchange].timestamp) {
                  this.tmpOrderbooks[exchange].asks = asks;
                }
              }
              console.log(exchange);

              // IF an exchange has both bid && asks, update global orderbook
              if (exchange && this.tmpOrderbooks[exchange] && Object.keys(this.tmpOrderbooks[exchange]).length > 2) {
                this.orderbooks[exchange] = new this.OrderBookClass().initializePoints(this.tmpOrderbooks[exchange]);

                // TODO:
                // trim the ends between highest min of asks, and lowest max of bids
                let minAsk = 0, maxBid = 0

                // Get all orderbooks and combine
                const combinedOrderbook = new this.OrderBookClass()
                Object.keys(this.orderbooks).forEach(exchange => {
                  const exOb = this.orderbooks[exchange]
                  exOb.bidsRaw.forEach(e => {
                    combinedOrderbook.addPoint(e, true)
                  })
                  exOb.asksRaw.forEach(e => {
                    combinedOrderbook.addPoint(e, true)
                  })
                })

                // Delay this so we dont repaint a bunch?
                // Waits for all exchanges latest snapshot before replace
                if (Object.keys(this.orderbooks).length >= this.store.state.assetExchanges.length) {
                  this.store.dispatch('update', { key: 'orderbook', value: combinedOrderbook.getOrderbook() })
                  this.store.dispatch('update', { key: 'orderbookBucketed', value: combinedOrderbook.getOrderbookBucketed() })
                  this.orderbooks = {};
                }
              }
            }
            break;
        }
      }
    }
  }

  setStore(store) {
    this.store = store;
  }

  setOrderbook(OrderBook) {
    this.OrderBookClass = OrderBook;
  }
}

export default {
  install: (app, OrderBook) => {
    if (window && window.web3data) {
      // TODO: Add back if needed
      // app.config.globalProperties.$w3d = { ...window.web3data }
      app.config.globalProperties.$w3s = new Websockets()
      app.config.globalProperties.$w3s.setStore(app.config.globalProperties.$store)
      app.config.globalProperties.$w3s.setOrderbook(app.config.globalProperties.$OrderBook)

      // load ws client!
      app.config.globalProperties.loadW3DConnection = apiKey => {
        if (!app.config.globalProperties.$w3s) {
          app.config.globalProperties.$w3s.reset(window.localStorage.apiKey || apiKey)
          app.config.globalProperties.$w3s.setStore(app.config.globalProperties.$store)
        }
      }

      return app.config.globalProperties.$w3s
    }
  }
}
