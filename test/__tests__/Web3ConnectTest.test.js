import React from 'react';
import TestProvider from '../TestProvider';
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  const tree = renderer.create(<TestProvider test />).toJSON();
  expect(tree).toMatchSnapshot();
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
