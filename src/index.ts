import { LoaderContext } from 'webpack';
import { compile } from 'ejs';
import { resolve } from 'path';

export default function ejsLoader(this: LoaderContext<{}>, content: string) {
  const template = compile(content, {
    root: resolve(__dirname, '../example'),
  })();

  return template;
}
