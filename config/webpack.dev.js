const paths = require('./paths');
const common = require('./webpack.common.js');
const merge = require('webpack-merge');
const webpack = require('webpack');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  devServer: {
    contentBase: paths.appBuild,
    publicPath: paths.servedPath,
    compress: true,
    port: 3035,
    hot: true,
    overlay: true,
    https: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx|mjs)$/,
        enforce: 'pre',
        loader: 'eslint-loader',
        exclude: /(node_modules|bower_components)/,
      },
      {
        test: /\.(js|jsx|mjs)$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              config: {
                path: paths.postcssConfigPath
              }
            }
          }
        ]
      }
    ]
  }
});
