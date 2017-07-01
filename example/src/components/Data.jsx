/* eslint-disable no-console */
import React, { PropTypes, Component } from 'react';
import Web3 from 'web3';
import { connect } from 'react-redux';
import ProviderEngine from 'web3-provider-engine';
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc';
import { web3Connect } from 'web3-redux';
// or compose with redux manually
// import { mapStateToProps, mapDispatchToProps, mergeProps } from 'web3-redux';

import SampleNameRegistry from '../sampleNameRegistry.sol';
import { customAction } from '../actions';

const NAME = 'hello';
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const COINBASE = '0x1dc01ef28e2a7dbd58a5459b38c5631902106a7f';

const rpcUrl = 'http://localhost:6545';
// compose a simple provider using web3-provider-engine
const engine = new ProviderEngine();
engine.addProvider(new RpcSubprovider({ rpcUrl }));
const web3Instance = new Web3(engine);

class Data extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleCustomAction = this.handleCustomAction.bind(this);
    this.handleGetBalance = this.handleGetBalance.bind(this);
    this.handleSetNetwork = this.handleSetNetwork.bind(this);
    this.handleUnsetNetwork = this.handleUnsetNetwork.bind(this);
    this.handleRemoveNetwork = this.handleRemoveNetwork.bind(this);
    this.handleGetBlockNumber = this.handleGetBlockNumber.bind(this);
    this.handleCreateTransaction = this.handleCreateTransaction.bind(this);
    this.handleDeployContract = this.handleDeployContract.bind(this);
    this.handleContractCall = this.handleContractCall.bind(this);
    this.handleContractTransaction = this.handleContractTransaction.bind(this);
  }
  componentDidMount() {
    this.handleSetNetwork();
  }
  handleCustomAction() {
    this.props.customAction();
  }
  handleSetNetwork() {
    this.props.web3Redux.setNetwork({ networkId: 'eth', web3: web3Instance });
  }
  handleUnsetNetwork() {
    this.props.web3Redux.setNetwork({ networkId: 'eth', web3: false });
  }
  handleRemoveNetwork() {
    this.props.web3Redux.removeNetwork({ networkId: 'eth' });
  }
  handleGetBlockNumber() {
    this.props.web3Redux.web3('eth').eth.getBlockNumber();
  }
  handleGetBalance() {
    this.props.web3Redux.web3('eth').eth.getBalance(COINBASE);
  }
  handleCreateTransaction() {
    const web3 = this.props.web3Redux.web3('eth');
    web3.eth.sendTransaction({ value: 1, to: NULL_ADDRESS, from: COINBASE })
    .then((txHash) => {
      console.log('got tx', txHash);
      return web3.eth.waitForMined(txHash);
    }).then((tx) => {
      console.log('Mined tx!', tx);
      this.handleGetBalance();
    });
  }
  handleDeployContract() {
    const web3 = this.props.web3Redux.web3('eth');
    web3.eth.contract(SampleNameRegistry.abi)
    .new({ data: SampleNameRegistry.unlinked_binary, from: COINBASE, gas: 300000 })
    .then(tx => web3.eth.waitForMined(tx))
    .then((deployed) => {
      console.log('deployed!', deployed);
      this.setState({ deployedContract: deployed.contractAddress });
      this.handleGetBalance();
    });
  }
  handleContractCall() {
    const web3 = this.props.web3Redux.web3('eth');
    web3.eth.contract(SampleNameRegistry.abi).at(this.state.deployedContract)
    .names.call(NAME).then((result) => {
      console.log('called', result);
    });
  }
  handleContractTransaction() {
    const web3 = this.props.web3Redux.web3('eth');
    web3.eth.contract(SampleNameRegistry.abi).at(this.state.deployedContract)
    .register.sendTransaction(NAME, COINBASE, { from: COINBASE, gas: 300000 })
    .then(txHash => web3.eth.waitForMined(txHash))
    .then((tx) => {
      console.log('Mined contrac tx!', tx);
      this.handleGetBalance();
    });
  }
  render() {
    const web3 = this.props.web3Redux.web3('eth');
    if (!web3) {
      return <div>Removed; set it again: <button onClick={this.handleSetNetwork}>Set</button></div>;
    }
    if (web3.connectionStatus() === 'connecting') {
      return <div>Connecting...</div>;
    }
    if (web3.connectionStatus() === 'disconnected') {
      return (
        <div>
          Connection Failed. Is the test server runnig at? {rpcUrl}
          <br />
          Try running <code>npm run testrpc</code>
        </div>
      );
    }
    if (web3.connectionStatus() === 'disabled') {
      return <div>Disabled; set it again: <button onClick={this.handleSetNetwork}>Set</button></div>;
    }
    const { web3Redux, web3ReduxDataStore, test, custom } = this.props;
    const contract = web3.eth.contract(SampleNameRegistry.abi).at(this.state.deployedContract);
    const balanceBigNumber = web3.eth.balance(COINBASE);
    const formattedBalance = balanceBigNumber && balanceBigNumber.shift(-18).toFormat(18);
    return (
      <div>
        <button onClick={this.handleCustomAction}>Custom Action</button>
        <br />
        <button onClick={this.handleUnsetNetwork}>Unset</button>
        <button onClick={this.handleRemoveNetwork}>Delete</button>
        <br />
        {web3Redux.networks.eth &&
          <div>
            <button onClick={this.handleGetBalance}>Get Balance</button>
            <button onClick={this.handleGetBlockNumber}>Get Block Number</button>
            <button onClick={this.handleCreateTransaction}>Create Transaction</button>
            <button onClick={this.handleDeployContract}>Deploy Contract</button>
            {this.state.deployedContract &&
              <p>
                Contract address: {this.state.deployedContract}
                <br />
                <button onClick={this.handleContractCall}>Call Contract</button>
                <button onClick={this.handleContractTransaction}>Create Contract Transaction</button>
              </p>
            }
            <p>Block: {web3.eth.blockNumber() || '?'}</p>
            <p>Balance of coinbase: {formattedBalance || '?'}</p>
            <p>Contract response: {contract.names(NAME) || '?'}</p>
          </div>
        }
        <p>Redux Store:</p>
        <pre>
          <code>{JSON.stringify({ web3Redux, web3ReduxDataStore, test, custom }, null, 2)}</code>
        </pre>
      </div>
    );
  }
}

Data.propTypes = {
  web3Redux: PropTypes.object.isRequired,
  customAction: PropTypes.func.isRequired,
  web3ReduxDataStore: PropTypes.object.isRequired,
  test: PropTypes.object.isRequired,
  custom: PropTypes.object.isRequired,
};

// not necessary to do this, just an example
function mstp({ custom, web3Redux }) {
  return { test: { someObject: true }, custom, web3ReduxDataStore: web3Redux };
}

// you can compose manually, like this
// const Web3ConnectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(Data);

// or, you could just export this
const Web3ConnectedComponent = web3Connect(connect, Data);

// or, inherit from react-redux - just here as an example
export default connect(mstp, { customAction })(Web3ConnectedComponent);
