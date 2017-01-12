# Web3-Redux

### Redixified Web3

`web3-redux` is a wrapper library for web3 that provides seamless integration into react-redux projects. It allows for familiar usage of web3 and contract methods in the react-redux style, and exposes a redux's middleware system for powerful state-tracking and caching options.

## Example Component

```javascript
export default class ExampleTokenBalanceAndTransfer extends Component {
  // typical react constructor
  constructor(props) {
    super(props);
    this.state = {};
    this.handleSend = this.handleSend.bind(this);
  }
  componentDidMount() {
    // fetch the balances when component is shown
    this.getBalances();
  }
  getBalances() {
    // pluck the passed props `contract` and `networks`
    const { contract, web3 } = this.props;
    // `web3-redux` provides promisified redux action creators:
    web3.eth.getBalance(accounts[0]);
    // ... and contract methods
    contract.balanceOf.call(accounts[0]);
    contract.balanceOf.call(accounts[1]);
  }
  handleSend() {
    const { contract, web3 } = this.props;
    // basic user input
    const tokens = prompt("How many tokens?");
    // ui: hide previous error
    this.setState({ error: false });
    // create the contract transaction, returns a promisified action creator
    contract.transfer.transaction(accounts[1], tokens, { from: accounts[0], gas: 150000 }))
    // pass returned `transactionHash` to the new `waitForMined` method
    .then(({ transactionHash }) => web3.eth.waitForMined(transactionHash))
    // the transaction is mined, updated balances can be fetched
    .then(() => this.getBalances())
    // ui: show an error if there is one at any point in the promise chain
    .catch((error) => this.setState({ error: `${error}` });
  }
  render() {
    const { contract, web3 } = this.props;
    const { error } = this.state;
    return (
      <div>
        {/* `balance` populated by result of latest `web3.eth.getBalance` */}
        <div>Eth Balance: {web3.eth.balance(accounts[0])}</div>
        {/* contract methods populated by their equivalent `method.call()` */}
        <div>Balance 1: {contract.balanceOf(accounts[0)}</div>
        <div>Balance 2: {contract.balanceOf(accounts[1)}</div>
        {error && <div>{error}</div>}
        <button onClick={this.handleSend}>Send</button>
      </div>
    );
  }
}
// contract and account props created by `web3Connect` (see docs below)
TokenBalance.propTypes = {
  contract: PropTypes.object.isRequired,
  accounts: PropTypes.array.isRequired,
};
```

## API

The `web3Connect`ed component will receive the following props:

### `status` object containing connectivity status

* `pending` *boolean* XHR requests pending

### `networks` object containing namespaced reduxified providers

Access `this.props.networks.default.web3` or swap `default` for a key you passed in the `web3Connect` config. Each network has a `web3` object with the following methods:

|Fetch Data|Return Value|
|---|---|
|`net.getListening()`|`net.listening()`|
|`net.getPeerCount()`|`net.peerCount()`|
|`version.getNode()`|`version.node()`|
|`version.getNetwork()`|`version.network()`|
|`version.getEthereum()`|`version.ethereum()`|
|`version.getWhisper()`|`version.whisper()`|
|`eth.getBalance()`|`eth.balance()`|
|`eth.getCode()`|`eth.code()`|
|`eth.getTransactionCount()`|`eth.transactionCount()`|
|`eth.getStorageAt()`|`eth.storageAt()`|
|`eth.getSyncing()`|`eth.syncing()`|
|`eth.getCoinbase()`|`eth.coinbase()`|
|`eth.getMining()`|`eth.mining()`|
|`eth.getHashrate()`|`eth.hashrate()`|
|`eth.getGasPrice()`|`eth.gasPrice()`|
|`eth.getAccounts()`|`eth.accounts()`|
|`eth.getBlockNumber()`|`eth.blockNumber()`|
|`eth.getBlock()`|`eth.block()`|
|`eth.getBlockTransactionCount()`|`eth.blockTransactionCount()`|
|`eth.getUncle()`|`eth.uncle()`|
|`eth.getTransactionFromBlock()`|`eth.transactionFromBlock()`|
|`eth.getTransaction()`|`eth.transaction()`|
|`eth.getTransactionReceipt()`|`eth.transactionReceipt()`|

Transaction Creators

* `eth.sendTransaction({ from, to, value, gas })`
* `eth.sendRawTransaction()`

Helper methods

* `eth.waitForMined(txHash)` waits for a transaction to be confirmed in a block

Contract Creator

* `eth.contract(abi)` define the contract using it's ABI
  * `at(address)` returns reduxified contract api linked to `address`
  * `new(arg1, arg2, { from, gas })` deploys and returns new reduxified instance

Contract Instances

```javascript
const MyContract = this.props.networks.default.web3.eth.contract(abi).at(address);
```

All ABI methods are converted with the following:

* `methodName.transaction(arg1, arg2)` promisified transaction action creator
* `methodName.call(arg1, arg2)` promisified data-fetching action creator
* `methodName(arg1, arg2)` returns latest resolved `call` value

## Usage

Add `web3-redux` to your `react-redux` project

```bash
npm install --save web3-redux;
```

Hook it up with your store

```javascript
// index.js
import React, { Component } from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

// middleware is optional, provides the `status` info
import middleware from 'web3-redux/src/middleware';
import reducer from 'web3-redux/src/reducer';

import App from './components/app';

const createStoreWithMiddleware = applyMiddleware(thunk, middleware)(createStore);
const store = createStoreWithMiddleware(reducer);

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <App />
      </Provider>
    );
  }
}
```

Use `web3Connect` once within your app

```javascript
// components/app.js
import Web3 from 'web3';
import web3Connect from 'redux-web3/web3Connect';

import Balances from './balances';

const tokenAbi = [ ... ];
const tokenAddress = '0x123..000';

class App extends Component {
  render() {
    const { networks, status } = this.props;
    const { web3 } = networks.default;
    return (
      <div>
        {status.pending && <div>Loading...</div>}
        <Balances
          web3={web3}
          tokenContract={web3.contract(tokenAbi).at(tokenAddress)}
        />
      </div>
    );
  }
}

App.propTypes = {
  networks: PropTypes.object.isRequired,
  status: PropTypes.object.isRequired,
};

// web3Connect injects the magic.
export default web3Connect({
  // key is the `networkId`
  default: new Web3(Web3.providers.HttpProvider('http://localhost:6545'))
})(App);
```

Use the action creators and getters

```javascript
// components/balances.js
const address = '0x123...def';

export default class Balances extends Component {
  componentDidMount() {
    // triggers action creators
    this.props.web3.eth.getBalance(address);
    this.props.tokenContract.balanceOf.call(address);
  }
  parseBalance(balance) {
    return balance ? balance.toNumber() / 1e18 : '?';
  }
  render() {
    const { web3, tokenContract } = this.props;
    const ethBalance = web3.eth.balance(address);
    const tokenBalance = tokenContract.balanceOf(address);
    return (
      <div>
        Eth Balance: {this.parseBalance(ethBalance)}
        <br />
        Token Balance: {this.parseBalance(tokenBalance)}
      </div>
    );
  }
}
```

Make transactions

```javascript
handleSubmit(e) {
  // handle the form submit
  e.preventDefault();
  // pluck the passed `props`
  const { account, decimals, tokenContract, web3 } = this.props;
  // parse the token value
  const value = (this.state.value || 0) * Math.pow(10, decimals);
  // a bit of validation
  if (!value) { return this.setState({ error: 'Enter value' }); }
  // update the UI
  this.setState({ loading: true, error: false });
  // make the transaction
  return tokenContract.transfer.transaction(this.state.to, value, { gas: 150000 }))
  // return a promise
  .then(({ transactionHash }) => {
    // update the ui with the transaction info
    this.setState({ transactionHash });
    return web3.eth.waitForMined(transactionHash);
  .then(() => {
    // transaction is mined!
    this.setState({ loading: false });
  }).catch((error) => {
    this.setState({ error: `${error}`, loading: false });
  });
}
```

## TODO

```
- v1
  - web3Connect: figure out caching
  - test all methods
- next
  - optimize getter/rerender?
  - more middleware
```
