import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import generateWeb3ReduxApi from './generateWeb3ReduxApi';
import generateNetworkApi from './generateNetworkApi';

function getWeb3Api(state, dispatch) {
  // for each network that exists, create it's API
  return {
    ...generateWeb3ReduxApi(dispatch),
    networks: Object.keys(state.networks).reduce((o, networkId) => {
      return { ...o, [networkId]: generateNetworkApi({ networkId, state, dispatch }) };
    }, {}),
  };
}

export default function web3Connect(passedMapStateToProps, passedActions) {
  // allow user to map custom map
  function mapStateToProps(state) {
    return { ...passedMapStateToProps(state), web3Redux: state.web3Redux };
  }

  function mapDispatchToProps(dispatch) {
    return { dispatch, ...passedActions };
  }

  function mergeProps(stateProps, dispatchProps) {
    const { dispatch, ...customActions } = dispatchProps;
    return {
      ...stateProps,
      ...bindActionCreators(customActions, dispatch),
      web3Redux: getWeb3Api(stateProps.web3Redux, dispatch),
    };
  }

  return connect(mapStateToProps, mapDispatchToProps, mergeProps);
}
