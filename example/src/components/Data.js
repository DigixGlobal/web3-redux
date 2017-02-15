import React, { Component } from 'react';
import Web3 from 'web3';
import web3Connect from 'web3-redux/src';

import { customAction } from '../actions';

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const COINBASE = '0x6d2a214876602e6ac7fe97204b295a19c844ec89';

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:6545'));

class Data extends Component {
  constructor(props) {
    super(props);
    this.handleCustomAction = this.handleCustomAction.bind(this);
    this.handleSetNetwork = this.handleSetNetwork.bind(this);
    this.handleUnsetNetwork = this.handleUnsetNetwork.bind(this);
    this.handleRemoveNetwork = this.handleRemoveNetwork.bind(this);
    this.handleGetBlockNumber = this.handleGetBlockNumber.bind(this);
    this.handleCreateTransaction = this.handleCreateTransaction.bind(this);
  }
  componentDidMount() {
    this.props.web3Redux.setNetwork({ networkId: 'eth', web3 });
  }
  handleCustomAction() {
    this.props.customAction();
  }
  handleSetNetwork() {
    this.props.web3Redux.setNetwork({ networkId: 'eth', web3 });
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
    this.props.web3Redux.networks.eth.web3.eth.sendTransaction({ value: 1, to: NULL_ADDRESS, from: COINBASE });
  }
  render() {
    console.log('rerender!');
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

function mapStateToProps({ custom, web3Redux }) {
  return { test: true, custom, web3ReduxDataStore: web3Redux };
}

export default web3Connect(mapStateToProps, { customAction })(Data);
// export default connect(mapStateToProps, { customAction })(Data);
