import React, { Component } from 'react';
import { connect } from 'react-redux';

class Data extends Component {
  render() {
    const test = { a: 'b', c: { d: 'e' } };
    return (
      <pre>
        <code>{JSON.stringify(test, null, 2)}</code>
      </pre>
    );
  }
}

export default connect()(Data);
