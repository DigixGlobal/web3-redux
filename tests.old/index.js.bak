import assert from 'assert';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import Web3 from 'web3';

import { reduxifyWeb3, reduxifyContract } from '../src/reduxifier';
import reducer from '../src/reducer';

import SimpleNameRegistry from './helpers/SimpleNameRegistry.sol';

const store = createStore(reducer, applyMiddleware(thunk));

const networkId = 'test-net';
const web3 = new Web3();
const provider = new web3.providers.HttpProvider('http://localhost:8545');
web3.setProvider(provider);
const web3Redux = reduxifyWeb3({ web3, networkId });

describe('web3-redux', function () {
  let txHash;
  let defaultAccount;
  let anotherAccount;

  describe('web3', function () {
    return ['eth.getAccounts', 'version.getNode'].map((key) => {
      return it(`${key} adds the method values to the store`, function () {
        const keys = key.split('.');
        return store.dispatch(web3Redux[keys[0]][keys[1]]())
        .then(() => {
          const result = store.getState().getIn([networkId, 'web3', keys[0], keys[1], '[]']);
          assert.ok(result.value);
          assert.ok(result.blockFetched);
        });
      });
    });
  });
  describe('contracts', function () {
    const regName = 'testing';
    let contract;
    let methods;
    // deploy in testrpc
    before((done) => {
      web3.eth.getAccounts((err, accounts) => {
        defaultAccount = accounts[0];
        anotherAccount = accounts[1];
        SimpleNameRegistry.setProvider(provider);
        SimpleNameRegistry.new({ from: defaultAccount, gas: 3000000 }).then((res) => {
          const { abi, address } = res;
          methods = reduxifyContract({ abi, address, web3, networkId });
          contract = res;
          done();
        });
      });
    });
    // TODO test errors
    it('tx - adds the transaction hash to the store', function () {
      return store.dispatch(methods.register(regName, defaultAccount, { from: defaultAccount, gas: 3000000 }))
      .then((txhash) => {
        const tx = store.getState().getIn([networkId, 'contracts', contract.address, 'transactions', txhash]);
        assert.ok(tx.txHash);
        txHash = tx.txHash;
        return new Promise(resolve => setTimeout(resolve, 10)); // wait for it to be mined
      });
    });
    it('call - adds the call method values to the store', function () {
      return store.dispatch(methods.names.call(regName, { from: defaultAccount }))
      .then(() => {
        const args = JSON.stringify([regName, { from: defaultAccount }]);
        assert.equal(store.getState().getIn([networkId, 'contracts', contract.address, 'calls', 'names', args]).value, defaultAccount);
      });
    });
  });
  describe('transactions', function () {
    it('gets the transaction info', function () {
      return store.dispatch(web3Redux.eth.getTransaction(txHash))
      .then((res) => {
        assert.ok(res.blockHash);
        assert.equal(store.getState().getIn([networkId, 'transactions', txHash]).value.blockHash, res.blockHash);
        return store.dispatch(web3Redux.eth.getTransactionReceipt(txHash));
      }).then((res) => {
        assert.ok(res.transactionHash);
        assert.equal(store.getState().getIn([networkId, 'transactions', txHash]).value.transactionHash, res.transactionHash);
      });
    });
    it('uses transaction store with eth.sendTransaction', function () {
      let newHash;
      return store.dispatch(web3Redux.eth.sendTransaction({ from: defaultAccount, to: anotherAccount, value: 3 }))
      .then((hash) => {
        newHash = hash;
        assert.ok(newHash);
        assert.ok(store.getState().getIn([networkId, 'transactions', newHash]).created);
        return store.dispatch(web3Redux.eth.getTransaction(newHash));
      }).then((res) => {
        assert.ok(res.blockHash);
        assert.equal(store.getState().getIn([networkId, 'transactions', newHash]).value.blockHash, res.blockHash);
        return store.dispatch(web3Redux.eth.getTransactionReceipt(newHash));
      }).then((res) => {
        assert.ok(res.transactionHash);
        assert.equal(store.getState().getIn([networkId, 'transactions', newHash]).value.transactionHash, res.transactionHash);
      });
    });
  });
});
