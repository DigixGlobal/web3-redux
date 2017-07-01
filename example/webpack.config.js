/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: [
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://localhost:8080',
    'webpack/hot/only-dev-server',
    './src/index.jsx',
  ],
  module: {
    loaders: [{
      test: /\.html$/,
      loader: 'html-loader',
    }, {
      test: /\.json$/,
      loader: 'json-loader',
    }, {
      test: /\.(js|jsx)$/,
      include: [
        path.resolve('./src'),
        path.resolve('./node_modules/web3-redux'),
        path.resolve('../src'),
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
    modules: [path.join(__dirname, 'node_modules')],
    extensions: ['.js', '.jsx'],
  },
  resolveLoader: {
    modules: [path.join(__dirname, 'node_modules')],
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
