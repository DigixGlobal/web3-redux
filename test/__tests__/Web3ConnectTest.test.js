import React from 'react';
import TestProvider from '../TestProvider';
import renderer from 'react-test-renderer';

const instance = renderer.create(<TestProvider />);
const { triggerMethod } = instance.toJSON().props;

function snapshotTest(getter) {
  if (getter) { triggerMethod((context) => context.setData(getter(context))); }
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

it('gets the correct values', () => {
  return new Promise((resolve) => {
    triggerMethod(({ props }) => {
      // do a series of these...
      resolve(Promise.all([
        props.web3s.default.version.getNode(),
        props.web3s.default.version.getNetwork(),
        // props.web3s.default.eth.getCoinbase(),
        // props.web3s.default.version.getEthereum(),
        // props.web3s.default.version.getWhisper(),
      ]));
    });
  })
  .then(() => snapshotTest(({ props }) => [
    props.web3s.default.version.node(),
    props.web3s.default.version.network(),
    // props.web3s.default.eth.coinbase(),
  ]));
});

// it('deploys the contract', () => {
//   const tree = renderer.create(
//     <TestProvider
//       onMount={() => {
//         return new Promise((resolve) => {
//           return setTimeout(resolve, 1000);
//         });
//       }}
//     />
//   ).toJSON();
//   return tree.props.onMount().then(() => {
//     console.log('deployed!');
//     expect(tree).toMatchSnapshot();
//   });
// });
