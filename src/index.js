// returns `addNetwork`, `removeNetwork` methods

function generateContractApi(dispatch) {

}

function generateNetworkApi({ networkApi, web3Api, dispatch }) {
  // disaptch
}

function generateWeb3ReduxApi(dispatch) {
  return {
    addNetwork,
    removeNetwork,
    pending,
  }
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
