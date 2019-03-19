# amberdata-example-gas-station
Build your own Ethereum Gas Station using Amberdata.io API!

Check out [the demo page](https://amberdata.github.io/amberdata-example-gas-station/)!

### Clone:
``
git clone git@github.com:amberdata/amberdata-example-gas-station.git
``

### Build:
```js
let getGasPredictions = async () => {
    return await axios({
        method:'get',
        url: 'https://web3api.io/api/v1/transactions/gas/predictions',
        headers: {"x-api-key": "UAK000000000000000000000000demo0001"}
    })
}
```
https://github.com/amberdata/amberdata-example-gas-station/blob/4480904388d816b2767d7cb4a98c3fccc34aaba8/index.js#L84-L90

```js
    let getGasPercentiles = async () => {
        return await axios({
            method:'get',
            url: 'https://web3api.io/api/v1/transactions/gas/percentiles',
            headers: {"x-api-key": "UAK000000000000000000000000demo0001"}
        })
    }
```
https://github.com/amberdata/amberdata-example-gas-station/blob/4480904388d816b2767d7cb4a98c3fccc34aaba8/index.js#L102-L109

## Resources

- [Contributing](./CONTRIBUTING.md)

## Licensing

This project is licensed under the [Apache Licence 2.0](./LICENSE).
