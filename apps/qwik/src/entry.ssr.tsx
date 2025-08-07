import { renderToStream, type RenderToStreamOptions } from '@builder.io/qwik/server';
import Root from './root';

export default function(opts: RenderToStreamOptions) {
  return renderToStream(<Root />, {
    manifest: opts.manifest,
    ...opts,
    containerAttributes: {
      lang: 'en-us',
      ...opts.containerAttributes
    }
  });
}
