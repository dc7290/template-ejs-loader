import { readFileSync } from 'fs'
import { resolve } from 'path'

import { compile, Options, Data } from 'ejs'
import { LoaderContext } from 'webpack'

import type { AdditionalData, SourceMap } from './types'
type EjsLoaderContext = LoaderContext<Options & { data?: Data | string }>

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
      // eslint-disable-next-line no-console
      console.log(result)
      resultContent = resultContent.replace(matches[1], `require('${result}')`)
    }

    matches = requirePattern.exec(content)
  }

  return resultContent
}

//here we don't use query string to set option anymore , because  type of some option value  is boolean
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const customStringify = (obj?: { [key: string]: any }, objectName?: string) => {
  const jsonObj = Object.assign({}, obj)
  const consoleColor = '\x1b[33m'
  const consoleColorReset = '\x1b[0m'
  Object.keys(jsonObj).forEach((o) => {
    if (typeof jsonObj[o] === 'function') {
      console.error(
        `${consoleColor}htmlWebpackPluginTemplateCustomizer => ${objectName}${o} is NOT supported, because wepack loader inline do not support options in which type is function.${consoleColorReset}`
      )
      delete jsonObj[o]
    }
  })
  return JSON.stringify(jsonObj)
}

export type htmlWebpackPluginTemplateCustomizerConfig = {
  htmlLoaderOption?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
  templateEjsLoaderOption?: Options & { data?: Data | string }
  templatePath?: string
}

export function htmlWebpackPluginTemplateCustomizer(config: htmlWebpackPluginTemplateCustomizerConfig) {
  const htmlLoader = require.resolve('html-loader') // get html-loader entry path
  const templateEjsLoader =
    process.env.NODE_ENV === 'test' ? resolve(process.cwd(), 'lib/index.js') : require.resolve('template-ejs-loader') // get template-ejs-loader entry path

  let htmlLoaderOption = `${customStringify(config.htmlLoaderOption, 'htmlLoaderOption : ')}` // get html-loader option
  let templateEjsLoaderOption = `${customStringify(config.templateEjsLoaderOption, 'templateEjsLoaderOption : ')}` // get template-ejs-loader option
  // Check if option string is empty; (And if it's not, prepend a questionmark '?');
  // This usage is about webpack loader inline, you can check the spec here : https://webpack.js.org/concepts/loaders/#inline
  if (htmlLoaderOption) {
    htmlLoaderOption = `?${htmlLoaderOption}`
  }
  if (templateEjsLoaderOption) {
    templateEjsLoaderOption = `?${templateEjsLoaderOption}`
  }
  // combile loaders/loader options/templatePath then generate customized template name
  return `!${htmlLoader}${htmlLoaderOption}!${templateEjsLoader}${templateEjsLoaderOption}!${config.templatePath}`
}

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

  const originalIncluder = loaderOptions.includer ?? null
  const customizeIncluder = (originalPath: string, parsedPath: string) => {
    this.addDependency(parsedPath)
    if (originalIncluder !== null) {
      return originalIncluder(originalPath, parsedPath)
    } else {
      return {
        filename: parsedPath,
      }
    }
  }

  loaderOptions.includer = customizeIncluder

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

    callback(null, template, sourceMap, additionalData)
  } catch (error) {
    callback(error as Error)
  }
}

export type { SourceMap, AdditionalData }
