import React, { Component } from 'react';
import { connect } from 'react-redux';
import Web3 from 'web3';
import { setNetwork, removeNetwork } from 'web3-redux/src/actions';
import web3Connect from 'web3-redux/src';

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:6545'));

class Data extends Component {
  constructor(props) {
    super(props);
    this.handleSetNetwork = this.handleSetNetwork.bind(this);
    this.handleUnsetNetwork = this.handleUnsetNetwork.bind(this);
    this.handleRemoveNetwork = this.handleRemoveNetwork.bind(this);
  }
  handleSetNetwork() {
    this.props.setNetwork({ networkId: 'eth', web3 });
  }
  handleUnsetNetwork() {
    this.props.setNetwork({ networkId: 'eth', web3: false });
  }
  handleRemoveNetwork() {
    this.props.removeNetwork({ networkId: 'eth' });
  }
  render() {
    const { web3Redux, test } = this.props;
    return (
      <div>
        <button onClick={this.handleSetNetwork}>Set</button>
        <button onClick={this.handleUnsetNetwork}>Unset</button>
        <button onClick={this.handleRemoveNetwork}>Delete</button>
        <pre>
          <code>{JSON.stringify({ web3Redux, test }, null, 2)}</code>
        </pre>
      </div>
    );
  }
}

function mapStateToProps() {
  return { test: true };
}

export default web3Connect(mapStateToProps)(Data);
// export default connect(mapStateToProps, { setNetwork, removeNetwork })(Data);
