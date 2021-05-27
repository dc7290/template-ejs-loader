import compiler from './compiler'
import { readFile as _readFile } from 'fs'
import { promisify } from 'util'

const readFilePromise = promisify(_readFile)

export const readFile = async (path: string, options: string = 'utf8') => minify(await readFilePromise(path, options))

export const minify = (str: string) =>
  str
    .replace(/\s{2,}/g, ' ') // remove duplicated whitespace
    .replace(/(^\s+|\s+$)/g, '') // remove whitespace from both ends of the string
    .replace(/(\>)\s+/g, '$1') // remove whitespace after html tags
    .replace(/\s+(\<)/g, '$1') // remove whitespace before html tags
    .replace(/(\r|\n)/g, '') // remove new lines

export const getCompiledOutput = async (fixturePath: string) => {
  const output = (await compiler(fixturePath)).toJson({ source: true }).modules[0].source

  if (typeof output !== 'string') {
    throw Error('output is Buffer')
  }

  return minify(
    output
      .match(/var\s*code\s*=\s*"(.*)";/)[1] // get the exported output from webpack
      .replace(/(\\r|\\n)/g, '') // remove escaped endlines
      .replace(/\\"/g, '"') // remove a slash from escaped quotes
  )
}
