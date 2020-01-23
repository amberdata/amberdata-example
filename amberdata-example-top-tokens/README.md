# amberdata-example-top-tokens
Build your own tokens ranking list for Ethereum using Amberdata.io! Example code uses token rankings endpoint

Check out [the demo page](https://amberdata.github.io/amberdata-example/amberdata-example-top-tokens/)!

### Clone:
``
git clone git@github.com:amberdata/amberdata-example.git
cd amberdata-example-top-token
``

### 1. Get API Key

Go to [amberdata.io](https://amberdata.io/pricing) and click "Get started"

### 2. Build:

Building with Amberdata.io is as simple as a few axios request:

```js

let config = {
        headers: {"x-api-key": "YOUR_API_KEY_HERE"}
    }

let getTopTokensMarketCap = () => axios.get(`https://web3api.io/api/v1/tokens/rankings?direction=descending&sortType=marketCap&timeInterval=d`, config)
let getTopTokensChangeInPrice = () => axios.get(`https://web3api.io/api/v1/tokens/rankings?direction=descending&sortType=changeInPrice&timeInterval=d`, config)
let getTopNFTs = () => axios.get(`https://web3api.io/api/v1/tokens/rankings?sortType=transactionVolume&type=erc721&timeInterval=d`, config)

```

See source [here](https://github.com/amberdata/amberdata-example/blob/594317ec03f2276969d14f7e4b628859184a02f2/amberdata-example-top-tokens/index.js#L26-L37).

## Resources

- [Contributing](./CONTRIBUTING.md)

## Licensing

This project is licensed under the [Apache Licence 2.0](./LICENSE).
