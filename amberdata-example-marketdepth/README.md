# amberdata-example-marketdata
Build your own websocket event stream for crypto market data using Amberdata.io! Example code uses [Amberdata's Websockets](https://docs.amberdata.io/reference#connection)

Check out [the demo page](https://amberdata.github.io/amberdata-example-marketdata/)!

### Clone:
``
git clone git@github.com:amberdata/amberdata-example-marketdata.git
``

### 1. Get API Key

Go to [amberdata.io](https://amberdata.io/pricing) and click "Get started"

### 2. Build:

Building with Amberdata.io is as simple as a few a few lines of code:

For Historical OHLCV -
```js
let config = {headers: {"x-api-key": "YOUR_API_KEY_HERE"}};
const getHistoricalOHLCV = (pair) => axios.get(`https://web3api.io/api/v1/market/ohlcv/${pair}/historical`, config);
```
See source [here](https://github.com/amberdata/amberdata-example-marketdata/blob/a22e2d3edee890567386b0804c104218f237a483/index.js#L37).

For live order book updates -
```js
// Create WebSocket connection.
const socket = new WebSocket('wss://ws.web3api.io?x-api-key=YOUR_API_KEY_HERE');

// Connection opened
socket.addEventListener('open', function (event) {
    console.log('Connection opened - ', event);
    socket.send(`{"jsonrpc":"2.0","id":0,"method":"subscribe","params":["market:orders",{"pair":"eth_btc","exchange":"gdax"}]}`);
});

// Listen for messages
socket.addEventListener('message', responseHandler);
```
See source [here](https://github.com/amberdata/amberdata-example-marketdata/blob/a22e2d3edee890567386b0804c104218f237a483/index.js#L52).

## Resources

- [Contributing](./CONTRIBUTING.md)

## Licensing

This project is licensed under the [Apache Licence 2.0](./LICENSE).

