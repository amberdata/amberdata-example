# amberdata-example-websockets
Build your own websocket event stream for Ethereum using Amberdata.io! Example code uses [Amberdata's Websockets](https://docs.amberdata.io/reference#connection)

Check out [the demo page](https://amberdata.github.io/amberdata-example/amberdata-example-websockets/)!

### Clone:
```bash
git clone git@github.com:amberdata/amberdata-example-websockets.git
cd amberdata-example-websockets
```

### 1. Get API Key

Go to [amberdata.io](https://amberdata.io/pricing) and click "Get started"

### 2. Build:

Building with Amberdata.io is as simple as a few a few lines of code:

```js
// Create WebSocket connection.
const socket = new WebSocket('wss://ws.web3api.io?x-api-key=YOUR_API_KEY_HERE');

// Connection opened
socket.addEventListener('open', function (event) {
    console.log('Connection opened - ', event);
    socket.send(`{"jsonrpc":"2.0","id":0,"method":"subscribe","params":["block"]}`);
    socket.send(`{"jsonrpc":"2.0","id":1,"method":"subscribe","params":["uncle"]}`);
    socket.send(`{"jsonrpc":"2.0","id":2,"method":"subscribe","params":["transaction"]}`);
    socket.send(`{"jsonrpc":"2.0","id":3,"method":"subscribe","params":["function"]}`);
});

// Listen for messages
socket.addEventListener('message', responseHandler);
```

See source [here](https://github.com/amberdata/amberdata-example/blob/0c63f4a0a1ea54d8744bf79b39eee58fd0eea34e/amberdata-example-websockets/index.js#L35-L60).

## Resources

- [Contributing](./CONTRIBUTING.md)

## Licensing

This project is licensed under the [Apache Licence 2.0](./LICENSE).

