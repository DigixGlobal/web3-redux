# web3-redux

react-redux web3 api - used in [Spectrum](https://github.com/spectrum/spectrum).

## Usage

`npm install web3-redux`

For a full example, see [/example](https://github.com/DigixGlobal/web3-redux/tree/master/example/src)

Demo the example with `npm run testrpc` -> `npm start`

To use, web3-redux, simply:

1. Add the web3Redux reducer to your redux store

```javascript
import { reducer as web3Redux } from 'web3-redux';

// ...

combineReducers({ web3Redux })

// ...

```

2. Connect your components

3. Register your web3 provider engine using `web3-provider-engine` 13+

```javascript
// example component

import Web3 from 'web3';
import { connect } from 'react-redux';
import ProviderEngine from 'web3-provider-engine';
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc';

// compose a simple provider using web3-provider-engine
const engine = new ProviderEngine();
engine.addProvider(new RpcSubprovider({ rpcUrl: 'https://mainnet.infura.io' }));
const web3 = new Web3(engine);

class MyComponent extends Component {
  componentDidMount() {
    // you probably want to do custom logic for setting
    this.props.web3Redux.setNetwork({ networkId: 'eth', web3 });
  }
  handleGetBlockNumber() {
    this.props.web3Redux.web3('eth').eth.getBlockNumber();
  }
  render() {
    cosnt web3 = this.props.web3Redux.web3('eth');
    if (!web3 || !web3.isConnected()) { return <p>Connecting...</p>; }
    return (
      <div>
        <p>Block: {web3.eth.blockNumber() || '?'}</p>
        <button onClick={this.handleGetBlockNumber}>Get Block Number</button>
      </div>
    )
  }
}

export default web3Connect(connect, YourComponent);
```

## Interaction

We support most of the web3 api, and contract methods.

```javascript
web3.eth.getBlockNumber() // makes a call to the server and saves response in redux
web3.eth.blockNumber() // gets returned value from redux store
// .. and so on for all the web3.eth `get` methods
web3.eth.sendTransaction(20, { from: account }) // will make a transaction, return the promise
.then(txHash => web3.eth.waitForMined(txHash)) // wait for the tx id to be mined
.then((tx) => console.log('got the tx!', tx)); // after mined, it returns populated tx data and logs
// or call `getTransaction` anywhere to pull it from redux store
web3.eth.getTransaction(tx);
```

## API

Main Web3 API

```
web3Redux
  addNetwork
  removeNetwork
  pendingRequests
  networks
    [networkId]
      web3
        connectionStatus
        isConnected
        pendingRequests
        networkId
        eth
          balance
          meta
          getBalance
          code
          getCode
          transactionCount
          getTransactionCount
          storageAt
          getStorageAt
          syncing
          getSyncing
          coinbase
          getCoinbase
          mining
          getMining
          hashrate
          getHashrate
          gasPrice
          getGasPrice
          accounts
          getAccounts
          blockNumber
          getBlockNumber
          block
          getBlock
          blockTransactionCount
          getBlockTransactionCount
          uncle
          getUncle
          transaction
          getTransaction
          transactionReceipt
          getTransactionReceipt
          sendTransaction
          sendRawTransaction
          contract
          waitForMined
        net
          listening
          meta
          getListening
          peerCount
          getPeerCount
        version
          node
          meta
          getNode
          network
          getNetwork
          ethereum
          getEthereum
          whisper
          getWhisper
```

Contract instances

```
web3.eth.contract(abi)
  at
  new
    [contract_instance]
      contract # original web3 contract instance
      address
      propsToState
      [abi_methods]
        call
        sendTransaction
        getData
```

## Redux State

```javascript
web3Redux: {
  networks: {
    'eth-mainnet': {
      web3Methods: {},
      meta: {
        enabled: false,
        connecting: false
      },
      transactions: {},
      contracts: {}
    },
    'eth-kovan': {
      web3Methods: {
        'eth.getBlockNumber([])': {
          value: 2311810,
          updated: '2017-06-26T16:41:47.552Z'
        },
        'eth.getBalance(["0x7ECdC55af01cD035279916C76caD9D9771FAf45A"])': {
          value: '3.161917524422999991932e+21',
          updated: '2017-06-26T16:43:18.075Z'
        },
        'eth.getBalance(["0x430e05465Aa49db8ECdf0753e3D34D04C11d97dc"])': {
          value: '200000000000000000',
          updated: '2017-06-26T16:43:18.065Z'
        }
      },
      meta: {
        enabled: true,
        connecting: false,
        connected: true,
        pending: 0
      },
      transactions: {
        '0xec912b8a6a24565cac0ac0236f3f76f0fb6dfc0033074cfe83cf38d6f0c53550': {
          created: '2017-06-26T16:43:03.536Z',
          value: {
            blockHash: '0x172be2dcc716201e30a72a8ce37f3127d4e5fb262839b8e213cf79b76eb54c4f',
            blockNumber: 2311829,
            contractAddress: null,
            cumulativeGasUsed: 66607,
            gasUsed: 21000,
            logs: [],
            logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
            root: null,
            transactionHash: '0xec912b8a6a24565cac0ac0236f3f76f0fb6dfc0033074cfe83cf38d6f0c53550',
            transactionIndex: 1
          },
          updated: '2017-06-26T16:43:17.452Z'
        },
        '0x7b27a45a88fc14051dcab7a5094681b311e27d686099dbfaf8e8724c7f1d2954': {
          created: '2017-06-26T16:43:46.737Z',
          value: {
            blockHash: '0xb4c778cc666de212c70ebc835ac80049666657467ba5f69c406605989cf48ddf',
            blockNumber: 2311839,
            contractAddress: null,
            cumulativeGasUsed: 357181,
            gasUsed: 357181,
            logs: [
              {
                address: '0x7a1767df4bad56ba284ac2a07b55d0825abab91c',
                blockHash: '0xb4c778cc666de212c70ebc835ac80049666657467ba5f69c406605989cf48ddf',
                blockNumber: 2311839,
                data: '0x00000000000000000000000000000000000000000000000000000000770de7c0',
                logIndex: 0,
                topics: [
                  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                  '0x0000000000000000000000007ecdc55af01cd035279916c76cad9d9771faf45a',
                  '0x000000000000000000000000430e05465aa49db8ecdf0753e3d34d04c11d97dc'
                ],
                transactionHash: '0x7b27a45a88fc14051dcab7a5094681b311e27d686099dbfaf8e8724c7f1d2954',
                transactionIndex: 0,
                transactionLogIndex: '0x0',
                type: 'mined'
              },
              {
                address: '0x7a1767df4bad56ba284ac2a07b55d0825abab91c',
                blockHash: '0xb4c778cc666de212c70ebc835ac80049666657467ba5f69c406605989cf48ddf',
                blockNumber: 2311839,
                data: '0x000000000000000000000000000000000000000000000000000000000027ac40',
                logIndex: 1,
                topics: [
                  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                  '0x0000000000000000000000007ecdc55af01cd035279916c76cad9d9771faf45a',
                  '0x00000000000000000000000063b7d3b6a162be538080bb69d6e41cfe0a2d298e'
                ],
                transactionHash: '0x7b27a45a88fc14051dcab7a5094681b311e27d686099dbfaf8e8724c7f1d2954',
                transactionIndex: 0,
                transactionLogIndex: '0x1',
                type: 'mined'
              }
            ],
            logsBloom: '0x00000000000000000001000000000000000000000000000000000000000000000000000000000000000080002000000020000000080000000000000000000000000080000000000000000008000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000010008000000000000000000000000000000000000000000000000002000000001000000000000000000000000002000100000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
            root: null,
            transactionHash: '0x7b27a45a88fc14051dcab7a5094681b311e27d686099dbfaf8e8724c7f1d2954',
            transactionIndex: 0
          },
          updated: '2017-06-26T16:43:59.035Z'
        }
      },
      contracts: {
        '0x7a1767df4bad56ba284ac2a07b55d0825abab91c': {
          transactions: [
            '0x7b27a45a88fc14051dcab7a5094681b311e27d686099dbfaf8e8724c7f1d2954'
          ],
          calls: {
            '.balanceOf(["0x7ECdC55af01cD035279916C76caD9D9771FAf45A"])': {
              value: '9986406875075582856',
              updated: '2017-06-26T16:43:59.439Z'
            },
            '.balanceOf(["0x430e05465Aa49db8ECdf0753e3D34D04C11d97dc"])': {
              value: '1997400000',
              updated: '2017-06-26T16:43:59.448Z'
            }
          }
        }
      }
    },
    etc: {
      web3Methods: {},
      meta: {
        enabled: false,
        connecting: false
      },
      transactions: {},
      contracts: {}
    },
    'eth-testrpc': {
      web3Methods: {},
      meta: {
        enabled: false,
        connecting: false
      },
      transactions: {},
      contracts: {}
    }
  },
  meta: {
    pending: 0
  }
}
```


## TODO

Better docs, tests, examples
