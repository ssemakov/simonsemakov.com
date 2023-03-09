import Document, { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";
import createEmotionServer from "@emotion/server/create-instance";
import createEmotionCache from "../lib/emotionCache";

const metadata = {
  title: "Simon's page",
  description: "Welcome to my corner of the internet!",
  icons: {
    icon: "/favicon.ico",
  },
};

export default class TheDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {this.props.emotionStyleTags}
          <meta name="description" content={metadata.description} />
          <meta name="theme-color" content="#000000" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

TheDocument.getInitialProps = async (context) => {
  const originalRenderPage = context.renderPage;

  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  context.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) =>
        function EnhanceApp(props) {
          return <App emotionCache={cache} {...props} />;
        },
    });

  const initialProps = await Document.getInitialProps(context);

  const emotionStyles = extractCriticalToChunks(initialProps.html);
  const emotionStyleTags = emotionStyles.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(" ")}`}
      key={style.key}
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ));

  return {
    ...initialProps,
    emotionStyleTags,
  };
};
