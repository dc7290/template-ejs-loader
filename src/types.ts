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
