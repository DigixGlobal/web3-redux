# web3-redux

Requires a web3 provider engine using `eth-block-tracker`.

## API

```javascript
// web3Redux object
{
  addNetwork({ networkId, web3 }),
  removeNetwork('networkId'),
  pendingRequests(), // 0, 1, 2, 3, 4
  networks: {
    [networkId]: {
      setWeb3(),
      isConnected(), // -1, 0, 1
      pendingRequests() // 0, 1, 2, 3, 4
      eth: {
        contract(abi),
        ...
      },
      net: { ... },
      version: { ... },
      net: { ... },
      [misc helpers, toHex, toBigNumber, etc.],
    },
  },
}
// contract instances
{
  at(),
  new(),
  [method](): {
    call(),
    sendTransaction(),
  }
}
```
