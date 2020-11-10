# amberdata-example-wallet
Build your own wallet for Ethereum using Amberdata.io! Example code uses account transactions and account balance

Check out [the demo page](https://amberdata.github.io/amberdata-example/amberdata-example-wallet/)!

### Clone:
```bash
git clone git@github.com:amberdata/amberdata-example.git
cd amberdata-example-wallet
```

### 1. Get API Key

Go to [amberdata.io](https://amberdata.io/pricing) and click "Get started"

### 2. Build:

Building with Amberdata.io is as simple as a few axios request:

```js

let getAddressBalance = async (address) => {
        return await axios({
            method:'get',
            url: `https://web3api.io/api/v2/addresses/${address}/account-balances?page=0&size=1`,
            headers: {"x-api-key": "YOUR_API_KEY_HERE"}
        })
    }

let getAddressTransactions = async (address) => {
    return await axios({
        method:'get',
        url: `https://web3api.io/api/v2/addresses/${address}/transactions?page=0&size=10`,
        headers: {"x-api-key": "YOUR_API_KEY_HERE"}
    })
}
```

See source [here](https://github.com/amberdata/amberdata-example/blob/a1ee54f291a478087a335ed131b8da987b82f6d3/amberdata-example-wallet/index.js#L54-L64).

## Resources

- [Contributing](./CONTRIBUTING.md)

## Licensing

This project is licensed under the [Apache Licence 2.0](./LICENSE).
