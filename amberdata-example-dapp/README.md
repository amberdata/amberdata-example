# amberdata-example-dapp
Build your first dApp for Ethereum using Amberdata.io API! Utilize ABI, logs, internal message &amp; transactions to display an interactive activity stream

Check out [the demo page](https://amberdata.github.io/amberdata-example-dapp/)!

### Clone:
``
git clone git@github.com:amberdata/amberdata-example-dapp.git
``

### 1. Get API Key

Go to amberdata.io and click "Get started"

### 2. Build:

Building with Amberdata.io is as simple as a few axios request:

```
let config = {
        headers: {"x-api-key": "YOUR_API_KEY_HERE"}
    }

let getAddressInformation = (address) => axios.get(`https://web3api.io/api/v1/addresses/${address}/information`, config)
let getContractFunctions = (address) => axios.get(`https://web3api.io/api/v1/contracts/${address}/functions`, config)
    let getAddressTransactions = (address) => axios.get(`https://web3api.io/api/v1/addresses/${address}/transactions?page=0&size=50`, config)
    let getAddressFunctions = (address) => axios.get(`https://web3api.io/api/v1/addresses/${address}/functions?page=0&size=50`, config)
    let getAddressLogs = (address) => axios.get(`https://web3api.io/api/v1/addresses/${address}/logs?page=0&size=50`, config)
```
See source [here](https://github.com/amberdata/amberdata-example-dapp/blob/ae5062d9eafc96ab8d6f3d396f6e6b1d478c97dd/index.js#L23-L37)

## Resources

- [Contributing](./CONTRIBUTING.md)

## Licensing

This project is licensed under the [Apache Licence 2.0](./LICENSE).
