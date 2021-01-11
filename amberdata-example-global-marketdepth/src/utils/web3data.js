const WEBSOCKET_SERVER_URL = 'wss://ws.web3api.io';

const ID_BLOCK = 1001;

class Websockets {
  constructor() {
    this.store = null;
    this.websocket = null;
    this.subscriptions = {};

    this.objects = {
      // ohlcv: { name: 'ohlcv', args: ["market:ohlcv", { pair: "btc_usd", exchange: "gdax" }], subscription: null, object: null },
      price: { name: 'price', args: ["market:prices:updates", { pair: "btc_usd" }], subscription: null, object: null },
      // orderEvents: { name: 'orderEvents', args: ["market:order:events", { pair: "btc_usd" }], subscription: null, object: null },
      // orderSnapshots: { name: 'orderSnapshots', args: ["market:order:snapshots", { pair: "btc_usd" }], subscription: null, object: null },
    };

    this.reset()
  }

  _addSubscription(data) {
    const subscription = data.result;
    if (subscription === true || subscription === false) return false;

    const id = data.id;
    this.objects[id].subscription = subscription;
    this.subscriptions[subscription] = id;
    // console.log(`New subscription: ${this.objects[id].name} - ${subscription}`)
  }

  _subscribe(id, args) {
    // console.log(`[WS >>>] subscribe::${args}...`);
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
    // console.log(`[WS >>>] unsubscribe::${this.objects[id].name}...`);
    this.websocket.send(
      JSON.stringify({
        jsonrpc: '2.0',
        method: 'unsubscribe',
        params: [this.objects[id].subscription],
        id,
      }),
    )
  }

  reset(apiKey) {
    // if (!apiKey) return;
    this.websocket = new WebSocket(`${WEBSOCKET_SERVER_URL}?x-api-key=${apiKey}`);

    const vm = this;

    this.websocket.addEventListener('open', function (event) {
      // console.log('[WS <<<] open', event);
      vm._subscribeAll()
    });

    this.websocket.addEventListener('message', function (message) {
      // console.log('[WS <<<] message', message.data);

      // Parse message data
      if (!message.data) return;
      const data = JSON.parse(message.data);

      // Check for subscription initialization messages
      if (data.id && data.result && vm.objects[data.id]) {
        vm._addSubscription(data)
      }

      // Check for subscription messages = new data
      if (data.method && data.method === 'subscription' && data.params && data.params.result && data.params.subscription) {
        const res = data.params.result;
        const subscription = data.params.subscription;

        if (vm.subscriptions[subscription] && vm.store) {
          const key = vm.objects[vm.subscriptions[subscription]].name;
          // console.log(key);
          const lag = 30 * 1000;
          const now = +new Date() - lag;
          let value = res
          let subKey

          switch (key) {
            case 'trades':
              const item = res[0]
              if (!(now > +new Date(item[2]))) {
                // all trades
                // Trade event data ordering is diff than REST
                const trade = [item[0], item[2], item[3], item[7], parseFloat(item[5]).toFixed(2), parseFloat(item[6]).toFixed(8), item[4]]
                vm.store.dispatch('pushItem', { key, value: trade })
                // update per-exchange
                vm.store.dispatch('addExchangePrice', { exchange: trade[0], price: parseFloat(trade[4]).toFixed(2), timestamp: trade[1] })
                // update global price value
                vm.store.dispatch('addSubItem', { key: 'price', subKey: 'price', value: parseFloat(trade[4]).toFixed(2) })
              }
              break;
            // case 'orderEvents':
            //   const item = res[0]
            //   subKey = item.exchange
            //   value = {}
            //   if (!(now > item.timestamp)) vm.store.dispatch('addSubItem', { key: 'tickers', subKey, value })
            //   break;
            case 'price':
              vm.store.dispatch('update', { key, value })
              break;
          }
        }
      }
    });

    this.websocket.addEventListener('close', function (event) {
      // console.log('[WS <<<] close', event);
      vm.reset(window.localStorage.apiKey);
    });
  }

  setStore(store) {
    this.store = store;
  }
}

export default {
  install: (app, store) => {
    if (window && window.web3data) {
      // TODO: Add back if needed
      // app.config.globalProperties.$w3d = { ...window.web3data }
      app.config.globalProperties.$w3s = new Websockets()
      // app.config.globalProperties.$w3s.setStore(store)
      app.config.globalProperties.$w3s.setStore(app.config.globalProperties.$store)

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
