import React from 'react';
import TestProvider from '../TestProvider';
import renderer from 'react-test-renderer';

import testContract from '../SimpleNameRegistry.sol';

const testAddress = '0x1233000000000000000000000000000000000001';
const gas = 3000000;
let from;
let contractAddress;

const instance = renderer.create(<TestProvider />);
const { triggerMethod } = instance.toJSON().props;

function snapshotTest(getter) {
  if (getter) {
    triggerMethod((context) => context.setData(typeof getter === 'function' && getter(context) || getter));
  }
  expect(instance.toJSON()).toMatchSnapshot();
}

it('initializes correctly', () => {
  snapshotTest(({ props }) => [
    props,
    props.web3s.default,
    props.web3s.default.eth,
    props.web3s.default.version,
    props.web3s.default.net,
  ].map(o => Object.keys(o)));
});

it('gets the correct web3 method values', (done) => {
  // TODO test all values
  triggerMethod(({ props }) => {
    Promise.all([
      props.web3s.default.version.getNode(),
      props.web3s.default.eth.getBalance(testAddress),
      props.web3s.default.eth.getCoinbase().then(res => { from = res; }),
    ])
    .then(() => snapshotTest([
      props.web3s.default.version.node(),
      props.web3s.default.eth.balance(testAddress),
    ]))
    .then(done);
  });
});

it('deploys contracts', (done) => {
  triggerMethod(({ props }) => {
    const { eth } = props.web3s.default;
    const contract = eth.contract(testContract.abi);
    contract.new({ data: testContract.unlinked_binary, from, gas })
    .then((tx) => {
      snapshotTest(() => Object.keys(tx));
      contractAddress = tx.contractAddress;
      return tx.transactionHash;
    })
    .then((txHash) => eth.waitForMined(txHash))
    .then(() => {
      snapshotTest(() => Object.keys(contract.at(contractAddress)));
    })
    .then(done);
  });
});

it('contract methods work', (done) => {
  triggerMethod(({ props }) => {
    const { eth } = props.web3s.default;
    const contract = eth.contract(testContract.abi);
    const contractInstance = contract.at(contractAddress);
    contractInstance.register.transaction('test', testAddress, { from, gas })
    .then((txHash) => {
      return eth.waitForMined(txHash);
    })
    .then(() => {
      return Promise.all([
        contractInstance.names.call('donate'),
        contractInstance.names.call('test'),
      ]);
    })
    .then(() => {
      snapshotTest([
        contractInstance.names('donate'),
        contractInstance.names('test'),
      ]);
    })
    .then(done);
  });
});
