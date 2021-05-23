import { readFileSync } from 'fs'
import { resolve } from 'path'

import { compile, Options, Data } from 'ejs'
import { LoaderContext } from 'webpack'

import { AdditionalData, SourceMap } from './types'

type EjsLoaderContext = LoaderContext<Options & { data?: Data }>

const getIncludeEjsDependencies = (content: string, options: Options) => {
  const dependencyPattern = /<%[_\W]?\s*include\(.*\)\s*[_\W]?%>/g

  let matches = dependencyPattern.exec(content)
  const dependencies: string[] = []

  while (matches) {
    const matchFilename = matches[0].match(/(['"`])[^'"`]*\1/)

    let filename = matchFilename !== null ? matchFilename[0].replace(/['"`]/g, '').replace(/^\//, '') : null

    if (filename !== null) {
      if (!filename.endsWith('.ejs')) {
        filename += '.ejs'
      }

      if (!dependencies.includes(filename)) {
        dependencies.push(resolve(options.root ?? '', filename))
      }
    }

    matches = dependencyPattern.exec(content)
  }

  return dependencies
}

const getRequireDependencies = (context: EjsLoaderContext, content: string) => {
  const dependencyPattern = /<%[_\W]?.*require\(.*\).*[_\W]?%>/g

  let matches = dependencyPattern.exec(content)
  const dependencies: string[] = []

  while (matches) {
    const matchFilename = matches[0].match(/(['"`])[^'"`]*\1/)

    let filename = matchFilename !== null ? matchFilename[0].replace(/['"`]/g, '') : null

    if (filename !== null && filename.match(/^[./]/) !== null && !dependencies.includes(filename)) {
      dependencies.push(resolve(context.context, filename))
    }

    matches = dependencyPattern.exec(content)
  }

  return dependencies
}

const requireFunction = (context: EjsLoaderContext, requestSource: string) => {
  if (requestSource.match(/^[./]/) === null) {
    return require(resolve(context.rootContext, 'node_modules', requestSource))
  } else if (requestSource.endsWith('.js')) {
    return require(resolve(context.context, requestSource))
  } else if (requestSource.endsWith('.json')) {
    const content = JSON.parse(readFileSync(resolve(context.context, requestSource), 'utf8'))
    return content
  }
}

export default async function ejsLoader(
  this: EjsLoaderContext,
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

  if (Object.keys(loaderOptions.data ?? {}).includes('require')) {
    callback(Error('Do not set "require" in the loader options'))
  }

  const parameter = Object.assign(
    {
      require: (source: string) => requireFunction(this, source),
    },
    loaderOptions.data
  )

  try {
    const template = await compile(content, ejsOptions)(parameter)

    const ejsDependencies = getIncludeEjsDependencies(content, ejsOptions)
    const requireDependencies = getRequireDependencies(this, content)

    ejsDependencies.concat(requireDependencies).forEach((dependency) => {
      this.addDependency(dependency)
    })

    callback(null, template, sourceMap, additionalData)
  } catch (error) {
    callback(error)
  }
}
