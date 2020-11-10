# amberdata-example-gas-station
Build your own Ethereum Gas Station using Amberdata.io API!

Check out [the demo page](https://amberdata.github.io/amberdata-example/amberdata-example-gas-station/)!

### Clone:
``
git clone git@github.com:amberdata/amberdata-example.git
cd amberdata-example-gas-station
``

### 1. Get API Key

Go to [amberdata.io](https://amberdata.io/pricing) and click "Get started"

### 2. Build:

Building with Amberdata.io is as simple as a few axios request:
```js
let getGasPredictions = async () => {
    return await axios({
        method:'get',
        url: 'https://web3api.io/api/v2/transactions/gas/predictions',
        headers: {"x-api-key": "YOUR_API_KEY_HERE"}
    })
}
```
See source [here](https://github.com/amberdata/amberdata-example/blob/ed8bf65c1e52af04cf1b83aede6b237abbd81801/amberdata-example-gas-station/index.js#L83-L89).

```js
    let getGasPercentiles = async () => {
        return await axios({
            method:'get',
            url: 'https://web3api.io/api/v2/transactions/gas/percentiles',
            headers: {"x-api-key": "YOUR_API_KEY_HERE"}
        })
    }
```
See source [here](https://github.com/amberdata/amberdata-example/blob/ed8bf65c1e52af04cf1b83aede6b237abbd81801/amberdata-example-gas-station/index.js#L101-L108).

## Resources

- [Contributing](./CONTRIBUTING.md)

## Licensing

This project is licensed under the [Apache Licence 2.0](./LICENSE).
