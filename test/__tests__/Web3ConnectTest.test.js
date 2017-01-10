import React from 'react';
import TestProvider from '../TestProvider';
import renderer from 'react-test-renderer';

it('renders correctly', (done) => {
  const instance = renderer.create(<TestProvider testProp />);
  // timeout to allow web3 to set itself up...
  setTimeout(() => {
    expect(instance.toJSON()).toMatchSnapshot();
    done();
  }, 20);
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
