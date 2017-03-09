import React, { PropTypes, Component } from 'react';
import Web3 from 'web3';
import web3Connect from 'web3-redux/src';

import SampleNameRegistry from '../sampleNameRegistry.sol.js';
import { customAction } from '../actions';

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const COINBASE = '0xf8813cdb443034cceee98d099adae7154abb9ae4';

const web3Instance = new Web3(new Web3.providers.HttpProvider('http://localhost:6545'));

class Data extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleCustomAction = this.handleCustomAction.bind(this);
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
    this.props.web3Redux.setNetwork({ networkId: 'eth', web3: web3Instance });
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
    this.props.web3Redux.networks.eth.web3.eth.getBlockNumber();
  }
  handleCreateTransaction() {
    const { web3 } = this.props.web3Redux.networks.eth;
    web3.eth.sendTransaction({ value: 1, to: NULL_ADDRESS, from: COINBASE })
    .then((txHash) => {
      console.log('got tx', txHash);
      return web3.eth.waitForMined(txHash);
    }).then((something) => {
      console.log('Mined tx!', something);
    });
  }
  handleDeployContract() {
    const { web3 } = this.props.web3Redux.networks.eth;
    web3.eth.contract(SampleNameRegistry.abi)
    .new({ data: SampleNameRegistry.unlinked_binary, from: COINBASE, gas: 300000 })
    .then((deployed) => {
      this.setState({ deployedContract: deployed.address });
    });
  }
  handleContractCall() {
    const { web3 } = this.props.web3Redux.networks.eth;
    web3.eth.contract(SampleNameRegistry.abi).at(this.state.deployedContract)
    .names.call('yolo').then((result) => {
      console.log('called', result);
    });
  }
  handleContractTransaction() {
    const { web3 } = this.props.web3Redux.networks.eth;
    web3.eth.contract(SampleNameRegistry.abi).at(this.state.deployedContract)
    .register.sendTransaction('yolo', COINBASE, { from: COINBASE, gas: 300000 })
    .then((txHash) => web3.eth.waitForMined(txHash))
    .then((tx) => console.log('Mined contrac tx!', tx));
  }
  render() {
    const { web3Redux, web3ReduxDataStore, test, custom } = this.props;
    return (
      <div>
        <button onClick={this.handleCustomAction}>Custom Action</button>
        <br />
        <button onClick={this.handleSetNetwork}>Set</button>
        <button onClick={this.handleUnsetNetwork}>Unset</button>
        <button onClick={this.handleRemoveNetwork}>Delete</button>
        <br />
        {web3Redux.networks.eth &&
          <div>
            <button onClick={this.handleGetBlockNumber}>Get Block Number</button>
            <button onClick={this.handleCreateTransaction}>Create Transaction</button>
            <button onClick={this.handleDeployContract}>Deploy Contract</button>
            {this.state.deployedContract &&
              <div>
                Contract address: {this.state.deployedContract}
                <br />
                <button onClick={this.handleContractCall}>Call Contract</button>
                <button onClick={this.handleContractTransaction}>Create Contract Transaction</button>
              </div>
            }
            <br />
            <p>Block: {web3Redux.networks.eth.web3.eth.blockNumber()}</p>
          </div>
        }
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

function mapStateToProps({ custom, web3Redux }) {
  return { test: { someObject: true }, custom, web3ReduxDataStore: web3Redux };
}

export default web3Connect(mapStateToProps, { customAction })(Data);
