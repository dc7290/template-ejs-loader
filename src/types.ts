export type SourceMap = {
  version: number
  sources: string[]
  mappings: string
  file?: string
  sourceRoot?: string
  sourcesContent?: string[]
  names?: string[]
}

export type AdditionalData = {
  [index: string]: any
  webpackAST: object
}

export type htmlWebpackPluginTemplateCustomizerConfig = {
  htmlLoaderOption? :{
    [key: string]: any
  },
  templateEjsLoaderOption?:{
    root?:string,
    data:{
      [key: string]: any
    }
  },
  templatePath?:string
}
