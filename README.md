# Web3-Redux

### Redixified Web3

`web3-redux` is a wrapper library for web3 that provides seamless integration into react-redux projects. It allows for familiar usage of web3 and contract methods in the react-redux style, and exposes a redux's middleware system for powerful state-tracking and caching options.

### Example Component

```javascript
export default class ExampleTokenBalanceAndTransfer extends Component {
  // typical react constructor
  constructor(props) {
    super(props);
    this.state = {};
    this.handleSend = this.handleSend.bind(this);
  }
  // fetch the balances when component is shown
  componentDidMount() {
    this.getBalances();
  }
  getBalances() {
    // pluck the passed props contract and web3s
    const { contract, web3 } = this.props;
    // web3-redux provides action promisified redux action creators:
    web3.eth.getBalance(accounts[0]);
    // contract methods
    contract.balanceOf.call(accounts[0]);
    contract.balanceOf.call(accounts[1]);
  }
  handleSend() {
    const { contract, web3 } = this.props;
    // basic user input
    const tokens = prompt("How many tokens?");
    // ui: hide previous error
    this.setState({ error: false });
    // create the contract transaction, returns a promisified 'thunk' action creator
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
        {/* `balance` populated by result of latest `balanceOf` call */}
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

### Usage

Add to your `react-redux` project

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
        <App {...this.props} />
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

const connectConfig = {
  // key is the `networkId`
  default: new Web3(Web3.providers.HttpProvider('http://localhost:6545')),
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
        Token Balance: {this.parseBalance(tokenBalance)}
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
    // handle the form submit
    e.preventDefault();
    // pluck the passed `props`
    const { account, decimals, tokenContract } = this.props;
    // parse the token value
    const value = (this.state.value || 0) * Math.pow(10, decimals);
    // a bit of validation
    if (!value) { return this.setState({ error: 'Enter value' }); }
    // update the UI
    this.setState({ loading: true, error: false });
    // make the transaction
    return tokenContract.transfer.transaction(this.state.to, value, { gas: 150000 }))
    // return a promise
    .then((txHash) => {
      // update the ui with the transaction info
      this.setState({ txHash, loading: false });
    // TODO wait for the transaction to be mined
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

Data fetchers returns thunkified promise action creators

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

Value getters return latest value of resolved associated action

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

Transaction Creators

  * `eth.sendTransaction({ from, to, value, gas })`
  * `eth.sendRawTransaction()`

Contract Creator

  * `eth.contract(abi)` define the contract using it's ABI
    * `at(address)` returns reduxified contract instance linked to `address`
    * `new(arg1, arg2, { from, gas })` *todo* deploys new instance and returns it
  * `ContractInstance.methodName`
    * `call(arg1, arg2, { from, gas })` thunkified action creator for fetching method `call` state
    * `()` value of resolved `call` actions
    * `transact(...args)` same as `call`, but creates a transaction


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
- ctrl + f TODO
- Nice example at start of docs
- Jest Tests
```
