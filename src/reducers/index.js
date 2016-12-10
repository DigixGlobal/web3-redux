import { createStore, applyMiddleware } from 'redux';
import { combineReducers } from 'redux-immutable';
import { fromJS } from 'immutable';
import thunk from 'redux-thunk';

import web3 from './web3';
import contracts from './contracts';
import transactions from './transactions';

const initialState = fromJS({});
const rootReducer = combineReducers({ web3, contracts, transactions });
export default createStore(rootReducer, initialState, applyMiddleware(thunk));
