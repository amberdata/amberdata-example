# amberdata-example-whale-activity
Build your own Multi-chain whale watching app using Amberdata.io! Example code uses token rankings endpoint

Check out [the demo page](https://amberdata.github.io/amberdata-example/amberdata-example-whale-activity/)!

### Clone:
``
git clone git@github.com:amberdata/amberdata-example.git
cd amberdata-example-whale-activity
``

### 1. Get API Key

Go to [amberdata.io](https://amberdata.io/onboarding) and click "Get started"

### 2. Build:

Building with Amberdata.io is as simple as including `web3data-js` either via cdn
or Node.Js. Check out the `web3data-js` [docs](https://web3data.github.io/web3data-js/) to learn more.

```js
const web3data = new Web3Data(YOUR_API_KEY)
web3data.connect()

// Transactions
web3data.on({eventName: 'transactions'}, txn => {
  // Insert logic here
  console.log(txn);
})

// Pending Transactions
web3data.on({eventName: 'pending_transactions'}, txn => {
  // Insert logic here
  console.log(txn);
})
```

See source [here]().

## Resources

- [Contributing](./CONTRIBUTING.md)

## Licensing

This project is licensed under the [Apache Licence 2.0](./LICENSE).
