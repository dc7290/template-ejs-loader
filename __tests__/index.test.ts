import path from 'path'
import { getCompiledOutput, readFile } from './utils'

const getOutputs = (folder: string) =>
  Promise.all([
    getCompiledOutput(`./fixtures/${folder}/index.ejs`),
    readFile(path.resolve(__dirname, `./fixtures/${folder}/index.html`)),
  ])

test('takes plain html as input and outputs it', async () => {
  const [ejsOutput, htmlOutput] = await getOutputs('plain-html')
  console.log(ejsOutput)
  expect(ejsOutput).toBe(htmlOutput)
})
