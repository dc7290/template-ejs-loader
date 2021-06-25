import { readFileSync } from 'fs'
import { resolve } from 'path'

import { compile, Options, Data } from 'ejs'
import { LoaderContext } from 'webpack'

import type { AdditionalData, SourceMap } from './types'

type EjsLoaderContext = LoaderContext<Options & { data?: Data | string }>

const getIncludeEjsDependencies = (context: EjsLoaderContext, content: string, options: Options) => {
  const dependencyPattern = /<%[_\W]?\s*include\([^%]*\)\s*[_\W]?%>/g

  let matches = dependencyPattern.exec(content)
  const dependencies: string[] = []

  while (matches) {
    const matchFilename = matches[0].match(/(['"`])[^'"`]*\1/)

    let filename = matchFilename !== null ? matchFilename[0].replace(/['"`]/g, '') : null

    if (filename !== null) {
      if (!filename.endsWith('.ejs')) {
        filename += '.ejs'
      }

      if (!dependencies.includes(filename)) {
        dependencies.push(
          /^\//.test(filename)
            ? resolve(options.root ?? '', filename.replace(/^\//, ''))
            : resolve(context.context, filename)
        )
      }
    }

    matches = dependencyPattern.exec(content)
  }

  return dependencies
}

const requireFunction = (requestPath: string) => {
  if (requestPath.endsWith('.json')) {
    return JSON.parse(readFileSync(requestPath, 'utf-8'))
  } else {
    return require(requestPath)
  }
}

const resolveRequirePaths = async (context: EjsLoaderContext, content: string) => {
  const requirePattern = /<%[_\W]?.*(require\(.*\)).*[_\W]?%>/g
  let resultContent = content

  let matches = requirePattern.exec(content)

  while (matches) {
    const matchFilename = matches[1].match(/(['"`])[^'"`]*\1/)
    const requestSource = matchFilename !== null ? matchFilename[0].replace(/['"`]/g, '') : null

    if (requestSource !== null) {
      const result = await context.getResolve()(context.context, requestSource)
      resultContent = resultContent.replace(matches[1], `require('${result}')`)
    }

    matches = requirePattern.exec(content)
  }

  return resultContent
}

export type { SourceMap, AdditionalData }

export default async function ejsLoader(
  this: EjsLoaderContext,
  content: string,
  sourceMap: string | SourceMap,
  additionalData: AdditionalData
) {
  const callback = this.async()

  const loaderOptions = this.getOptions()
  if (loaderOptions.data !== undefined && typeof loaderOptions.data === 'string') {
    Object.assign(loaderOptions, { data: JSON.parse(loaderOptions.data) })
  }
  const ejsOptions = Object.assign(
    {
      filename: this.resourcePath,
    },
    loaderOptions
  )

  if (Object.keys(loaderOptions.data ?? {}).includes('require')) {
    callback(Error('Do not set "require" in the loader options'))
  }

  const currentHtmlWebpackPlugin = this._compiler?.options.plugins.filter(
    (plugin) =>
      typeof plugin === 'object' &&
      plugin.options &&
      plugin.options.template &&
      plugin.options.template === this.resource
  )[0]
  const templateParameters = {}
  if (
    typeof currentHtmlWebpackPlugin === 'object' &&
    typeof currentHtmlWebpackPlugin.options.templateParameters !== 'function'
  ) {
    Object.assign(templateParameters, {
      htmlWebpackPlugin: {
        options: currentHtmlWebpackPlugin.options.templateParameters,
      },
    })
  }

  const parameter = Object.assign(
    {
      require: (source: string) => requireFunction(source),
    },
    loaderOptions.data,
    templateParameters
  )

  try {
    const resolveContent = await resolveRequirePaths(this, content)
    const template = await compile(resolveContent, ejsOptions)(parameter)

    const ejsDependencies = getIncludeEjsDependencies(this, content, ejsOptions)

    ejsDependencies.forEach((dependency) => {
      this.addDependency(dependency)
    })

    callback(null, template, sourceMap, additionalData)
  } catch (error) {
    callback(error)
  }
}
