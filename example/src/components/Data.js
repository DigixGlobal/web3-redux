import React, { Component } from 'react';
import Web3 from 'web3';
import web3Connect from 'web3-redux/src';

import { customAction } from '../actions';

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:6545'));

class Data extends Component {
  constructor(props) {
    super(props);
    this.handleCustomAction = this.handleCustomAction.bind(this);
    this.handleSetNetwork = this.handleSetNetwork.bind(this);
    this.handleUnsetNetwork = this.handleUnsetNetwork.bind(this);
    this.handleRemoveNetwork = this.handleRemoveNetwork.bind(this);
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
  render() {
    const { web3Redux, test, custom } = this.props;
    return (
      <div>
        <button onClick={this.handleCustomAction}>Custom Action</button>
        <br />
        <button onClick={this.handleSetNetwork}>Set</button>
        <button onClick={this.handleUnsetNetwork}>Unset</button>
        <button onClick={this.handleRemoveNetwork}>Delete</button>
        <pre>
          <code>{JSON.stringify({ web3Redux, test, custom }, null, 2)}</code>
        </pre>
      </div>
    );
  }
}

function mapStateToProps({ custom }) {
  return { test: true, custom };
}

export default web3Connect(mapStateToProps, { customAction })(Data);
// export default connect(mapStateToProps, { setNetwork, removeNetwork })(Data);
