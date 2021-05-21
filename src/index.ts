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

  const template = await compile(content, ejsOptions)(loaderOptions.data)

  const dependencyPattern = /<%[_\W]?\s*include\(.*\)\s*[_\W]?%>/g

  const matches = dependencyPattern.exec(template)
  const dependencies: string[] = []

  if (matches === null) {
  } else {
    matches.forEach((match) => {})
  }

  callback(null, template, sourceMap, additionalData)
}
