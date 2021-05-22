import { resolve } from 'path'

import { compile, Options } from 'ejs'
import { LoaderContext } from 'webpack'

import { AdditionalData, SourceMap } from './types'

export default async function ejsLoader(
  this: LoaderContext<Options & { data: any }>,
  content: string,
  sourceMap: string | SourceMap,
  additionalData: AdditionalData
) {
  const callback = this.async()

  const loaderOptions = this.getOptions()
  const ejsOptions = Object.assign(
    {
      filename: this.resourcePath,
    },
    loaderOptions
  )

  try {
    const template = await compile(content, ejsOptions)(loaderOptions.data)
    const dependencyPattern = /<%[_\W]?\s*include\(.*\)\s*[_\W]?%>/g

    let matches = dependencyPattern.exec(content)
    const dependencies: string[] = []

    if (matches === null) {
    } else {
      while (matches) {
        const matchFilename = matches[0].match(/(['"`])[^'"`]*\1/)

        let filename = matchFilename !== null ? matchFilename[0].replace(/['"`]/g, '').replace(/^\//, '') : null

        if (filename !== null) {
          if (!filename.endsWith('.ejs')) {
            filename += '.ejs'
          }

          if (!dependencies.includes(filename)) {
            dependencies.push(resolve(ejsOptions.root ?? '', filename))
          }
        }

        matches = dependencyPattern.exec(content)
      }
    }

    dependencies.forEach((dependency) => {
      this.addDependency(dependency)
    })

    callback(null, template, sourceMap, additionalData)
  } catch (error) {
    callback(error)
  }
}
