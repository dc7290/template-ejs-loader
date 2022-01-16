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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [index: string]: any
  webpackAST: object
}
