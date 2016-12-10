import assert from 'assert';
import Web3 from 'web3';
import store from '../src/reducers';
import { reduxifyWeb3, reduxifyContract } from '../src/reduxifier';

import SimpleNameRegistry from './helpers/SimpleNameRegistry.sol';

const web3 = new Web3();
const provider = new web3.providers.HttpProvider('http://localhost:8545');
web3.setProvider(provider);

describe('web3-redux', function () {
  const web3Redux = reduxifyWeb3({ web3 });
  let txHash;

  describe('web3', function () {
    return ['eth.getAccounts', 'version.getNode'].map((key) => {
      return it(`${key} adds the method values to the store`, function () {
        const keys = key.split('.');
        return store.dispatch(web3Redux[keys[0]][keys[1]]())
        .then(() => {
          const result = store.getState().getIn(['web3', keys[0], keys[1], '[]']);
          assert.ok(result.value);
          assert.ok(result.blockFetched);
        });
      });
    });
  });
  describe('contracts', function () {
    const regName = 'testing';
    let contract;
    let defaultAccount;
    let methods;
    // deploy in testrpc
    before((done) => {
      web3.eth.getAccounts((err, accounts) => {
        defaultAccount = accounts[0];
        SimpleNameRegistry.setProvider(provider);
        SimpleNameRegistry.new({ from: defaultAccount, gas: 3000000 }).then((res) => {
          const { abi, address } = res;
          methods = reduxifyContract({ abi, address, web3 });
          contract = res;
          done();
        });
      });
    });
    // TODO test errors
    it('tx - adds the transaction hash to the store', function () {
      return store.dispatch(methods.register(regName, defaultAccount, { from: defaultAccount, gas: 3000000 }))
      .then((txId) => {
        const tx = store.getState().getIn(['contracts', contract.address, 'transactions', txId]);
        assert.ok(tx.txHash);
        // save this for later
        txHash = tx.txHash;
        // HACK wait for it to be mined...
        return new Promise(resolve => setTimeout(resolve, 10));
      });
    });
    it('call - adds the call method values to the store', function () {
      return store.dispatch(methods.names.call(regName, { from: defaultAccount }))
      .then(() => {
        const args = JSON.stringify([regName, { from: defaultAccount }]);
        assert.equal(store.getState().getIn(['contracts', contract.address, 'calls', 'names', args]).value, defaultAccount);
      });
    });
  });
  describe('transactions', function () {
    it('gets the transaction info', function () {
      return store.dispatch(web3Redux.eth.getTransaction(txHash))
      .then((res) => {
        assert.ok(res.blockHash);
        assert.ok(store.getState().getIn(['transactions', txHash]).value.blockHash);
        return store.dispatch(web3Redux.eth.getTransactionReceipt(txHash));
      }).then((res) => {
        assert.ok(res.logs);
        assert.ok(store.getState().getIn(['transactions', txHash]).value.logs);
      });
    });
  });
});
