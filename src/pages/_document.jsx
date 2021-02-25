import Document, {
  Html, Head, Main, NextScript,
} from 'next/document';

export default class CustomDocument extends Document {
  static async getInitialProps(ctx) {
    const path = ctx.asPath;
    const initialProps = await Document.getInitialProps(ctx);

    return { ...initialProps, path };
  }

  render({files, lowPriorityFiles, polyfillFiles, devFiles, pages}) {

    //const devID = NextScript.contextType[1]._devOnlyInvalidateCacheQueryString;
    const toCache = Object.assign([], files, lowPriorityFiles, polyfillFiles, devFiles).filter(e => e).map(e => (`/_next/${e}`));

    return (
      <Html style={{ scrollBehavior: 'smooth' }} prefix="og: https://ogp.me/ns# fb: https://ogp.me/ns/fb# article: https://ogp.me/ns/article#">
        <Head />
        <body>
          <div id="fb-root" />
          <Main />
          <NextScript />
          {
            process.env.NODE_ENV !== 'development' && (
              <script dangerouslySetInnerHTML={{ __html: `if (window.caches) { caches.open("offline-app").then(function (cache) {cache.addAll(${JSON.stringify(toCache)});}); }` }} />
            )
          }
        </body>
      </Html>
    );
  }
}
