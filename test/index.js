import assert from 'assert';
import Web3 from 'web3';
import store from '../src/reducers';
import { web3ReduxMethods } from '../src/actions/web3';
import { contractReduxMethods } from '../src/actions/contracts';

import SimpleNameRegistry from './helpers/SimpleNameRegistry.sol';

const web3 = new Web3();
const provider = new web3.providers.HttpProvider('http://localhost:8545');
web3.setProvider(provider);

describe('web3', function () {
  const reduxWeb3 = web3ReduxMethods({ web3 });
  return ['eth.getAccounts', 'version.getNode'].map((key) => {
    return it(`${key} adds the method values to the store`, function () {
      const keys = key.split('.');
      return store.dispatch(reduxWeb3[keys[0]][keys[1]]())
      .then(() => {
        const result = store.getState().getIn(['web3', keys[0], keys[1], '[]']);
        assert.notEqual(result.value, undefined);
        assert.notEqual(result.block, undefined);
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
        methods = contractReduxMethods({ abi, address, web3 });
        contract = res;
        done();
      });
    });
  });
  it('adds the transaction method values to the store', function () {
    return store.dispatch(methods.register.transaction(regName, defaultAccount, { from: defaultAccount, gas: 3000000 }))
    .then(() => {
      const args = JSON.stringify([regName, defaultAccount, { from: defaultAccount }]);
      const txHash = store.getState().getIn(['contracts', contract.address, 'register', 'transaction', args]).value;
      assert.ok(txHash);
      // HACK wait for it to be mined...
      return new Promise(resolve => setTimeout(resolve, 10));
    });
  });
  it('adds the call method values to the store', function () {
    return store.dispatch(methods.names.call(regName, { from: defaultAccount, gas: 3000000 }))
    .then(() => {
      const args = JSON.stringify([regName, { from: defaultAccount }]);
      assert.equal(store.getState().getIn(['contracts', contract.address, 'names', 'call', args]).value, defaultAccount);
    });
  });
});
