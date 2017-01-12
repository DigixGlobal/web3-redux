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
    props.networks,
    props.networks.default,
    props.networks.default.web3,
    props.networks.default.web3.eth,
    props.networks.default.web3.version,
    props.networks.default.web3.net,
  ].map(o => Object.keys(o)));
});

it('gets the correct web3 method values', (done) => {
  // TODO test all values
  triggerMethod(({ props }) => {
    Promise.all([
      props.networks.default.web3.version.getNode(),
      props.networks.default.web3.eth.getBalance(testAddress),
      props.networks.default.web3.eth.getCoinbase().then(res => { from = res; }),
    ])
    .then(() => snapshotTest([
      props.networks.default.web3.version.node(),
      props.networks.default.web3.eth.balance(testAddress),
    ]))
    .then(done);
  });
});

it('deploys contracts', (done) => {
  triggerMethod(({ props }) => {
    const { eth } = props.networks.default.web3;
    const contract = eth.contract(testContract.abi);
    contract.new({ data: testContract.unlinked_binary, from, gas })
    .then((deployed) => {
      snapshotTest(() => Object.keys(deployed));
      contractAddress = deployed.address;
    })
    .then(done);
  });
});

it('contract methods work', (done) => {
  triggerMethod(({ props }) => {
    const { eth } = props.networks.default.web3;
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
