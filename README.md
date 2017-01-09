# Web3-Redux

## Work in Progress

### Redixified Web3

`web3-redux` is a complete API wrapper for web3 that provides seamless integration into react-redux projects.

It allows for intuitive usage of web3 and contract methods in the react-redux environment, and exposes a redux's middleware system for powerful state-tracking and caching options.

### Usage

Add to your react-redux project

```bash
npm install --save web3-redux;
```

Hook up the reducer and middleware

```javascript
// index.js
import React, { Component } from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import middleware from 'web3-redux/src/middleware';
import reducer from 'web3-redux/src/reducer';

import App from './components/app';

const createStoreWithMiddleware = applyMiddleware(thunk, middleware)(createStore);
const store = createStoreWithMiddleware(reducer);

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <App {...this.props} />
      </Provider>
    );
  }
}
```

Use `web3Connect` top level of your app

```javascript
// components/app.js
import Web3 from 'web3';
import web3Connect from 'redux-web3/web3Connect';

import Balances from './balances';

const tokenAbi = [ ... ];
const tokenAddress = '0x123..000';

const connectConfig = {
  default: new Web3(Web3.providers.HttpProvider('http://localhost:6545')),
};

class App extends Component {
  render() {
    const { web3s, status } = this.props;
    const web3 = web3s.default;
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
  web3s: PropTypes.object.isRequired,
  status: PropTypes.object.isRequired,
};

export default web3Connect(() => connectConfig)(App);
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
        Unicorn Balance: {this.parseBalance(tokenBalance)}
      </div>
    );
  }
}
```

Make transactions

```javascript
export default class Balances extends Component {
  // ...
  handleSubmit(e) {
    e.preventDefault();
    const { account, decimals, tokenContract } = this.props;
    const value = (this.state.value || 0) * Math.pow(10, decimals);
    if (!value) { return this.setState({ error: 'Enter value' }); }
    this.setState({ loading: true, error: false });
    return tokenContract.transfer.transaction(this.state.to, value, { gas: 150000 }))
    .then((txHash) => {
      this.setState({ txHash, loading: false });
    }).catch((error) => {
      this.setState({ error: `${error}`, loading: false });
    });
  }
  // ...
}
```

## API

The `web3Connect`ed component will receive the following props:

### `status` object containing connectivity status

`pending` XHR requests pending *boolean*

### `web3s` object containing namespaced reduxified providers

Access `this.props.web3s.default.web3` or swap `default` for a key you passed in the `web3Connect` config.  Each network has a `web3` object with the following methods:

* Contract Creator (promise)
  * `eth.contract(abi)` returns reduxified contract instance (see below)
    * `at(address)`
    * `new(arg1, arg2, { from, gas })` *todo*
* Transaction creators returns thunkified (promise) action creators
  * `eth.sendTransaction`
  * `eth.sendRawTransaction`
* Data fetchers returns thunkified (promise) action creators
  * `net.getListening()`
  * `net.getPeerCount()`
  * `version.getNode()`
  * `version.getNetwork()`
  * `version.getEthereum()`
  * `version.getWhisper()`
  * `eth.getBalance()`
  * `eth.getCode()`
  * `eth.getTransactionCount()`
  * `eth.getStorageAt()`
  * `eth.getSyncing()`
  * `eth.getCoinbase()`
  * `eth.getMining()`
  * `eth.getHashrate()`
  * `eth.getGasPrice()`
  * `eth.getAccounts()`
  * `eth.getBlockNumber()`
  * `eth.getBlock()`
  * `eth.getBlockTransactionCount()`
  * `eth.getUncle()`
  * `eth.getTransactionFromBlock()`
  * `eth.getTransaction()`
  * `eth.getTransactionReceipt()`
* Value getters return latest value of resolved associated action
  * `net.listening()`
  * `net.peerCount()`
  * `version.node()`
  * `version.network()`
  * `version.ethereum()`
  * `version.whisper()`
  * `eth.balance()`
  * `eth.code()`
  * `eth.transactionCount()`
  * `eth.storageAt()`
  * `eth.syncing()`
  * `eth.coinbase()`
  * `eth.mining()`
  * `eth.hashrate()`
  * `eth.gasPrice()`
  * `eth.accounts()`
  * `eth.blockNumber()`
  * `eth.block()`
  * `eth.blockTransactionCount()`
  * `eth.uncle()`
  * `eth.transactionFromBlock()`
  * `eth.transaction()`
  * `eth.transactionReceipt()`

### Contract instances

```javascript
const MyContract = this.props.web3s.default.web3.contract(abi).at(address);
```

All ABI methods are converted with the following:

* `methodName.transaction(arg1, arg2)` thunkified (promise) transacting action creator
* `methodName.call(arg1, arg2)` thunkified (promise) data-fetching action creator
* `methodName(arg1, arg2)` returns latest resolved `call` value

## TODO

```
- More extensive API Docs
- Tests
```
