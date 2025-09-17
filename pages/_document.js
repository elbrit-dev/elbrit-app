import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Critical connection hints */}
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="dns-prefetch" href="//img.plasmic.app" />
          <link rel="dns-prefetch" href="//img.plasmiccdn.com" />
          <link rel="dns-prefetch" href="//images.plasmic.app" />

          {/* Self-hosted variable fonts preloads */}
          <link
            rel="preload"
            as="font"
            href="/fonts/GeistVF.woff"
            type="font/woff"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            as="font"
            href="/fonts/GeistMonoVF.woff"
            type="font/woff"
            crossOrigin="anonymous"
          />

          {/* Minimize layout shift */}
          <meta name="theme-color" content="#ffffff" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;


