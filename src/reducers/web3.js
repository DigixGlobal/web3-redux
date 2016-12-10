import { fromJS } from 'immutable';

import { getArgsKey } from '../helpers';
import { actions } from '../actions/web3';

import fetch from './fetch';

export default function reducer(state = fromJS({}), action) {
  return fetch(state, actions, action, getArgsKey(action));
}
