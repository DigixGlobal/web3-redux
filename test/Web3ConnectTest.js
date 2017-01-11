import React, { PropTypes, Component } from 'react';
import Web3 from 'web3';

import web3Connect from '../src/web3Connect';

class Web3ConnectTest extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleTrigger = this.handleTrigger.bind(this);
    this.setData = this.setData.bind(this);
  }
  componentDidMount() {
    this.props.web3s.default.version.getNode();
  }
  setData(data) {
    this.setState({ data: JSON.stringify({ test: data }) });
  }
  handleTrigger(method) {
    return method(this);
  }
  render() {
    return (
      <div triggerMethod={this.handleTrigger}>
        {JSON.stringify(this.state.data)}
      </div>
    );
  }
}

Web3ConnectTest.propTypes = {
  web3s: PropTypes.object.isRequired,
  status: PropTypes.object.isRequired,
};

export default web3Connect({
  default: new Web3(new Web3.providers.HttpProvider('http://localhost:6545')),
})(Web3ConnectTest);
