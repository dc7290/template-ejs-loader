import { readFile as _readFile } from 'fs'
import { promisify } from 'util'

const readFilePromise = promisify(_readFile)

export const readFile = async (path: string, options = 'utf8') => minify(await readFilePromise(path, options))

export const minify = (str: string) =>
  str
    .replace(/\s{2,}/g, ' ') // remove duplicated whitespace
    .replace(/(^\s+|\s+$)/g, '') // remove whitespace from both ends of the string
    .replace(/(>)\s+/g, '$1') // remove whitespace after html tags
    .replace(/\s+(<)/g, '$1') // remove whitespace before html tags
    .replace(/(\r|\n)/g, '') // remove new lines
