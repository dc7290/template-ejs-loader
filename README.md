# template-ejs-loader

[![npm](https://img.shields.io/npm/v/template-ejs-loader.svg)](https://www.npmjs.com/package/template-ejs-loader)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/dc7290/template-ejs-loader/blob/main/LICENSE)

[日本語](https://github.com/dc7290/template-ejs-loader/blob/main/docs/README-ja.md)

[EJS](http://www.embeddedjs.com/) (Embeded JavaScript) loader for [Webpack](http://webpack.js.org). It converts EJS templates to plain HTML using the [EJS npm package](https://www.npmjs.com/package/ejs).

- [features](#features)
- [installation](#installation)
- [usage](#usage)
- [importing partials](#importing-partials)
- [importing js/json files](#importing-files)
- [Importing node modules](#importing-modules)
- [Passing individual values](#passing-individual-values)
- [more info](#more-info)

## <a name="features"></a>Features

- webpack5 support
- Import `.js`,`.json` and `node modules` using `require`
- All files can be passed values.

## <a name="installation"></a> Instalation

```bash
npm i -D template-ejs-loader
```

## <a name="usage"></a> Usage

**NOTE:** You need to chain the template-ejs-loader with an html loader such as the [html-loader](https://www.npmjs.com/package/html-loader) and use a template plugin such as the [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin). To install these run `npm i -D html-loader html-webpack-plugin`.

Inside your `webpack config file` add the fallowing rules

```js
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.ejs$/i,
        use: ['html-loader', 'template-ejs-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/ejs/index.ejs',
    }),
  ],
  // ...
}
```

## Options

You can set the values supported by ejs.
See [here](https://www.npmjs.com/package/ejs#options) for the values.

The following are your own configuration options.
| Name | Type | Default | Description |
| :-----------------------: | :--------: | :-----: | :-------------------------------- |
| **[`data`](#data)** | `{Object}` | `{}` | |

### `data`

Type: `Object`
Default: `{}`

Use this if you want to pass the same value to all ejs files.
If you want to pass individual values, see [here](#passing-individual-values).

## <a name="importing-partials"></a> Importing partials

```html
<!-- plain import -->
<%- include('components/footer.ejs') %>

<!-- appending data -->
<%- include('components/header.ejs', { title: 'TOP' }) %>
```

_Example:_

`index.ejs`

```html
<%- include('/components/header.ejs', { title: 'TOP' }) %>

<%- include('/components/footer.ejs') %>
```

`header.ejs`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><%= title %></title>
  </head>

  <body>
```

`footer.ejs`

```html
</body>
</html>
```

**Note:** Include preprocessor directives (<% include user/show %>) are not supported in ejs v3.0+.

## <a name="importing-files"></a> Importing JavaScript or JSON files

`index.ejs`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <% const meta = require('../data/index-meta.js') %>
    <%- include('components/header.ejs', meta) %>
  </head>
  <!-- ... -->
</html>
```

`index-meta.js`

```js
module.exports = {
  title: 'Webpack Starter App',
  author: 'John Doe',
  keywords: ['lorem', 'ipsum', 'dolor', 'sit', 'amet'],
  description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit.',
  customFunction: function () {
    // ...
  },
}
```

## <a name="importing-modules"></a> Importing node modules

`index.ejs`

```html
<!DOCTYPE html>
<html lang="en">
  <!-- ... -->

  <div>
    <% const _ = require('lodash') %>
    <%= _.join(['a','b','c'], '~') %>
  </div>

  <!-- ... -->
</html>
```

## <a name="passing-individual-values"></a> Passing individual values

If you are getting all your `htmlWebpackPlugin` instances generated within a loop, and you want to get indivisual passing values for each `.ejs` template as variables, you can try this. (This method is using `webapck loader inline` mechanic to load every `ejs` file instead, you can also set html-loader/template-ejs-Loader options for each `.ejs` file.)

Unfortunaly, because `webapck loader inline` does not support loader option in which type is function, so basicly the option `preprocessor` of `html-loader` is **NOT** supported here, better try another way if you need to do interpolate things, for example: using `templateEjsLoaderOption.data` to set individual inject value.

`webpack.config.js`

```javascript
const { htmlWebpackPluginTemplateCustomizer }  = require('template-ejs-loader')
...
module.exports = {
  ...

  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: htmlWebpackPluginTemplateCustomizer({

        templatePath:'./src/index.ejs' // ejs template path 

        htmlLoaderOption:{
          // you can set individual html-loader option here.
          // but preprocessor option is not supported.
        },
        templateEjsLoaderOption:{ // set individual template-ejs-loader option here
          root:'', // this is for example, if not needed, just feel free to delete.
          data:{ // example, too.
            foo:'test' // btw, you can have indivisual data injection for each .ejs file using data option
          }
        }
      }),
    }),
  ]

  ...
}
```

## <a name="more-info"></a> More info

For more info on how to use EJS visit their [npm package page](https://www.npmjs.com/package/ejs) or their [official website](http://ejs.co/)
