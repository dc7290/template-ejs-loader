const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')

const { htmlWebpackPluginTemplateCustomizer } = require(path.resolve(__dirname, '../lib/index.js'))

const fixtures = [
  'plain-html',
  'include-partials',
  'include-json',
  'include-common-js',
  'include-node-modules',
  'path-alias',
]

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'fixtures/main.js'),
  output: {
    path: path.resolve(__dirname, 'results'),
    filename: 'main.js',
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
              root: path.resolve(__dirname, './fixtures/include-partials'),
            },
          },
        ],
      },
    ],
  },
  plugins: [
    ...fixtures.map(
      (folder) =>
        new HtmlWebpackPlugin({
          filename: path.join(folder, 'index.html'),
          template: path.resolve(__dirname, 'fixtures', folder, 'index.ejs'),
          minify: false,
        })
    ),
    new HtmlWebpackPlugin({
      filename: 'passing-individual-values/index.html',
      template: htmlWebpackPluginTemplateCustomizer({
        templatePath: path.resolve(__dirname, 'fixtures/passing-individual-values/index.ejs'),
        templateEjsLoaderOption: {
          data: {
            foo: 'bar',
          },
        },
      }),
    }),
  ],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './fixtures'),
    },
  },
}
