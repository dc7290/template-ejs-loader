import fs from 'fs'
import path from 'path'
import { readFile } from './utils'

const getOutputs = (folder: string): Promise<[correctOutputs: string, buildOutputs: string]> =>
  Promise.all([
    readFile(path.resolve(__dirname, `./fixtures/${folder}/index.html`)),
    readFile(path.resolve(__dirname, `./results/${folder}/index.html`)),
  ])

describe("It's a webpack build test.", () => {
  test('takes plain html as input and outputs it', async () => {
    const [correctOutputs, buildOutputs] = await getOutputs('plain-html')
    expect(correctOutputs).toBe(buildOutputs)
  })

  test('includes ejs partials and can pass ejs options', async () => {
    const [correctOutputs, buildOutputs] = await getOutputs('include-partials')
    expect(correctOutputs).toBe(buildOutputs)
  })

  test('includes json files', async () => {
    const [correctOutputs, buildOutputs] = await getOutputs('include-json')
    expect(correctOutputs).toBe(buildOutputs)
  })

  test('includes common js modules', async () => {
    const [correctOutputs, buildOutputs] = await getOutputs('include-common-js')
    expect(correctOutputs).toBe(buildOutputs)
  })

  test('includes node modules', async () => {
    const [correctOutputs, buildOutputs] = await getOutputs('include-node-modules')
    expect(correctOutputs).toBe(buildOutputs)
  })

  test('does the path alias work', async () => {
    const [correctOutputs, buildOutputs] = await getOutputs('path-alias')
    expect(correctOutputs).toBe(buildOutputs)
  })
})
