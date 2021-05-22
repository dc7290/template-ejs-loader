const template = `<!DOCTYPE html>
  <html lang="ja">

  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
  </head>


  <body>
    <%- include('/div.ejs', { data: 'foo' }) %>
    <img src="~image.png" alt="" style="max-width: 100%;">
    <%- include('/div.ejs', { data: 'foo' }) %>
  </body>

  </html>
  `

const dependencyPattern = /<%[_\W]?\s*include\(.*\)\s*[_\W]?%>/g

let matches = dependencyPattern.exec(template)
const dependencies = []

if (matches === null) {
} else {
  while (matches) {
    let filename = matches[0]
      .match(/(['"`])[^'"`]*\1/)[0]
      .replace(/['"`]/g, '')
      .replace(/^\//, '')

    if (!filename.endsWith('.ejs')) {
      filename += '.sejs'
    }

    if (!dependencies.includes(filename)) {
      dependencies.push(filename)
    }

    matches = dependencyPattern.exec(template)
  }
}
