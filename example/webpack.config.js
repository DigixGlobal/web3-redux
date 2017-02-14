const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: [
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://localhost:8080',
    'webpack/hot/only-dev-server',
    './src/index.js',
  ],
  module: {
    loaders: [{
      test: /\.html$/,
      loader: 'html-loader',
    }, {
      test: /\.js$/,
      include: [
        path.resolve('./src'),
        // TODO unlink
        fs.realpathSync('./node_modules/web3-redux'),
      ],
      loader: 'babel-loader',
    }],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new HtmlWebpackPlugin({ template: './src/index.html' }),
  ],
  resolve: {
    modules: ['node_modules', path.join(__dirname, 'node_modules')],
  },
  devtool: '#module-inline-source-map',
  devServer: {
    hot: true,
    publicPath: '/',
  },
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, './dist'),
    publicPath: '/',
  },
};
