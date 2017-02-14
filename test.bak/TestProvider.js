import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { combineReducers } from 'redux-immutable';
import thunk from 'redux-thunk';

import middleware from '../src/middleware';
import reducer from '../src/reducer';

import Web3ConnectTest from './Web3ConnectTest';

const createStoreWithMiddleware = applyMiddleware(thunk, middleware)(createStore);
const reducers = combineReducers({ web3Redux: reducer });
const store = createStoreWithMiddleware(reducers);

export default class TestProvider extends Component {
  render() {
    return (
      <Provider store={store}>
        <Web3ConnectTest />
      </Provider>
    );
  }
}
