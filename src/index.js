import { connect } from 'react-redux';

function generateContractApi(dispatch) {

}

function generateNetworkApi({ networkApi, web3Api, dispatch }) {
  // disaptch
}

function generateWeb3ReduxApi(state, dispatch) {
  console.log(state, dispatch);
  // for each network that exists, create it's API
  return { test: true };
  // return {
  //   addNetwork,
  //   removeNetwork,
  //   pending,
  // }
  // for each network in store.networks, return the

  // addNetwork({ networkId, web3 }),
  // removeNetwork('networkId')
}

// cache the created network API

// export default function () {
//   function mapStateToProps() {
//
//   }
//   function mapDispatchToProps() {
//
//   }
//   return
// }

export default function web3Connect(passedMapStateToProps) {
  // allow user to map custom map
  function mapStateToProps(state) {
    return { ...passedMapStateToProps(state), web3Redux: state.web3Redux };
  }

  function mapDispatchToProps(dispatch) {
    return { dispatch };
  }

  function mergeProps(stateProps, { dispatch }) {
    return {
      ...stateProps,
      web3Redux: generateWeb3ReduxApi(stateProps.web3Redux, dispatch),
    };
  }

  return connect(mapStateToProps, mapDispatchToProps, mergeProps);
}
