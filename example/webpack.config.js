const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/js/index.js',
  },
  devServer: {
    stats: {
      children: true,
    },
    contentBase: './dist',
  },
  module: {
    rules: [
      {
        test: /\.ejs$/i,
        use: [
          'html-loader',
          {
            loader: path.resolve(__dirname, '../lib/index.js'),
            options: {
              root: './src/ejs',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, './src/ejs/index.ejs'),
    }),
    new HtmlWebpackPlugin({
      filename: 'about/index.html',
      template: path.resolve(__dirname, './src/ejs/about/index.ejs'),
    }),
  ],
  stats: true,
}
