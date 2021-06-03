import path from 'path'

import compiler, { EjsOptinos } from './compiler'
import { getCompiledOutput, readFile } from './utils'

const getOutputs = (folder: string, options: EjsOptinos = {}) =>
  Promise.all([
    getCompiledOutput(`./fixtures/${folder}/index.ejs`, options),
    readFile(path.resolve(__dirname, `./fixtures/${folder}/index.html`)),
  ])

test('takes plain html as input and outputs it', async () => {
  const [ejsOutput, htmlOutput] = await getOutputs('plain-html')
  expect(ejsOutput).toBe(htmlOutput)
})

test('includes ejs partials and can pass ejs options', async () => {
  const [ejsOutput, htmlOutput] = await getOutputs('include-partials', {
    root: path.resolve(__dirname, './fixtures/include-partials'),
  })
  expect(ejsOutput).toBe(htmlOutput)
})

test('does not remove require statements outside ejs tags', async () => {
  const [ejsOutput, htmlOutput] = await getOutputs('outside-ejs')
  expect(ejsOutput).toBe(htmlOutput)
})

test('includes json files', async () => {
  const [ejsOutput, htmlOutput] = await getOutputs('include-json')
  expect(ejsOutput).toBe(htmlOutput)
})

test('includes common js modules', async () => {
  const [ejsOutput, htmlOutput] = await getOutputs('include-common-js')
  expect(ejsOutput).toBe(htmlOutput)
})

test('includes node modules', async () => {
  const [ejsOutput, htmlOutput] = await getOutputs('include-node-modules')
  expect(ejsOutput).toBe(htmlOutput)
})

test('can pass html-webpack-plugin parameters', async () => {
  const source = (
    await compiler(path.resolve(__dirname, './fixtures/include-htmlWebpackPluginParameters/index.js'), {}, true)
  )
    .toJson({ source: true })
    .children[0].modules.filter(
      (module) =>
        typeof module.id === 'string' && module.id.endsWith('./fixtures/include-htmlWebpackPluginParameters/index.ejs')
    )[0].source

  if (typeof source !== 'string') {
    throw Error('ejs output is Buffer')
  }

  const ejsOutput = eval(source.replace(/export default code;/, 'module.exports = code'))
  const htmlOutput = await readFile(
    path.resolve(__dirname, './fixtures/include-htmlWebpackPluginParameters/index.html')
  )

  expect(ejsOutput).toBe(htmlOutput)
})
