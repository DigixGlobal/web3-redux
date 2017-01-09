import React, { PropTypes, Component } from 'react';
import Web3 from 'web3';

import web3Connect from '../src/web3Connect';

const connectConfig = {
  default: new Web3(Web3.providers.HttpProvider('http://localhost:6545')),
};

class Web3ConnectTest extends Component {
  render() {
    return (
      <div>{JSON.stringify({ props: Object.keys(this.props) })}</div>
    );
  }
}

Web3ConnectTest.propTypes = {
  web3s: PropTypes.object.isRequired,
  status: PropTypes.object.isRequired,
};

export default web3Connect(() => connectConfig)(Web3ConnectTest);
