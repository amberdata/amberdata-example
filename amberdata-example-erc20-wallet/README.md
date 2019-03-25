# amberdata-erc20-wallet
Build your own ERC20 Token wallet for Ethereum using Amberdata.io! Example code uses account transactions and account balance

Check out [the demo page](https://amberdata.github.io/amberdata-erc20-wallet/)!

### Clone:
``
git clone git@github.com:amberdata/amberdata-erc20-wallet.git
``

### 1. Get API Key

Go to [amberdata.io](https://amberdata.io/pricing) and click "Get started"

### 2. Build:

Building with Amberdata.io is as simple as a few axios request:

```js

let config = {
        headers: {"x-api-key": "YOUR_API_KEY_HERE"}
    }

let getAddressInformation = (address) => axios.get(`https://web3api.io/api/v1/addresses/${address}/tokens`, config)
let getCurrentTokenTransfers = (address) => axios.get(`https://web3api.io/api/v1/tokens/${address}/transfers?page=0&size=50`, config)

```

See source [here](https://github.com/amberdata/).

## Resources

- [Contributing](./CONTRIBUTING.md)

## Licensing

This project is licensed under the [Apache Licence 2.0](./LICENSE).
