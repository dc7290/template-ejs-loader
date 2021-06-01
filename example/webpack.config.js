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
    stats: 'errors-warnings',
    contentBase: './dist',
  },
  module: {
    rules: [
      {
        test: /\.html$/i,
        use: ['html-loader'],
      },
      {
        test: /\.ejs$/i,
        use: [
          {
            loader: require.resolve('html-webpack-plugin/lib/loader'),
            options: {
              force: true,
            },
          },
          'html-loader',
          {
            loader: path.resolve(__dirname, '../lib/index.js'),
            options: {
              root: './src/ejs',
              data: {
                foo: 'foo',
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    // new HtmlWebpackPlugin({
    //   filename: 'index.html',
    //   template: path.resolve(__dirname, './src/ejs/index.ejs'),
    // }),
    // new HtmlWebpackPlugin({
    //   filename: 'about/index.html',
    //   template: path.resolve(__dirname, './src/ejs/about/index.ejs'),
    // }),
    new HtmlWebpackPlugin({
      filename: 'test/index.html',
      template: path.resolve(__dirname, './src/ejs/test/index.ejs'),
      templateParameters: {
        data: {
          foo: 'foo',
        },
      },
    }),
  ],
  stats: true,
}
