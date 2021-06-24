import path from 'path'

import { Data, Options } from 'ejs'
import { createFsFromVolume, Volume } from 'memfs'
import webpack, { Stats } from 'webpack'

export type EjsOptinos = Options & { data?: Data }

export default (fixture: string, options: EjsOptinos = {}): Promise<Stats> => {
  const compiler = webpack({
    mode: 'development',
    context: __dirname,
    entry: fixture,
    output: {
      path: path.resolve(__dirname),
      filename: '[name].ejs',
    },
    module: {
      rules: [
        {
          test: /\.ejs$/,
          use: [
            'html-loader',
            {
              loader: path.resolve(__dirname, '../lib/index.js'),
              options,
            },
          ],
        },
      ],
    },
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './fixtures'),
      },
    },
  })

  compiler.outputFileSystem = createFsFromVolume(new Volume())
  compiler.outputFileSystem.join = path.join.bind(path)

  return new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error) reject(error)
      if (stats.hasErrors()) reject(stats.toJson().errors)

      resolve(stats)
    })
  })
}
