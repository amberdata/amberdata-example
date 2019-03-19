# amberdata-example-wallet
Build your own wallet for Ethereum using Amberdata.io! Example code uses account transactions and account balance

Check out [the demo page](https://amberdata.github.io/amberdata-example-wallet/)!

### Clone:
``
git clone git@github.com:amberdata/amberdata-example-wallet.git
``

### 1. Get API Key

Go to [amberdata.io](https://amberdata.io/pricing) and click "Get started"

### 2. Build:

Building with Amberdata.io is as simple as a few axios request:

```js

let getAddressBalance = async (address) => {
        return await axios({
            method:'get',
            url: `https://web3api.io/api/v1/addresses/${address}/account-balances?page=0&size=1`,
            headers: {"x-api-key": "UAK000000000000000000000000demo0001"}
        })
    }

let getAddressTransactions = async (address) => {
    return await axios({
        method:'get',
        url: `https://web3api.io/api/v1/addresses/${address}/transactions?page=0&size=10`,
        headers: {"x-api-key": "UAK000000000000000000000000demo0001"}
    })
}
```

See source [here](https://github.com/amberdata/amberdata-example-wallet/blob/45a7c2f6de403569656b4ea35fa26668ea252c97/index.js#L70-L84).

## Resources

- [Contributing](./CONTRIBUTING.md)

## Licensing

This project is licensed under the [Apache Licence 2.0](./LICENSE).
