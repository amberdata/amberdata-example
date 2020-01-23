# amberdata-example-dapp
Build your first dApp for Ethereum using Amberdata.io API! Utilize ABI, logs, internal message &amp; transactions to display an interactive activity stream

Check out [the demo page](https://amberdata.github.io/amberdata-example/amberdata-example-dapp/)!

### Clone:
```bash
git clone git@github.com:amberdata/amberdata-example.git
cd amberdata-example-dapp
```

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
See source [here](https://github.com/amberdata/amberdata-example/blob/5060c4193d9cc551e23f9374d4661fa1b0c3a6a4/amberdata-example-dapp/index.js#L21-L37)

## Resources

- [Contributing](./CONTRIBUTING.md)

## Licensing

This project is licensed under the [Apache Licence 2.0](./LICENSE).
