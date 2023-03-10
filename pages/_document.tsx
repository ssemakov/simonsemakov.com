import type { AppProps, AppType} from 'next/app'
import Document, { Html, Head, Main, NextScript, DocumentContext, DocumentProps } from "next/document";
import createEmotionServer from "@emotion/server/create-instance";
import createEmotionCache from "../lib/emotionCache";
import { TheAppProps } from "./_app";

const metadata = {
  title: "Simon's page",
  description: "Welcome to my corner of the internet!",
  icons: {
    icon: "/favicon.ico",
  },
};

interface TheDocumentProps extends DocumentProps {
  emotionStyleTags: JSX.Element[];
}

export default function TheDocument({ emotionStyleTags }: TheDocumentProps) {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content={metadata.description} />
        <meta name="theme-color" content="#000000" />
        {emotionStyleTags}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

TheDocument.getInitialProps = async (context: DocumentContext) => {
  const originalRenderPage = context.renderPage;

  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  context.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App: React.ComponentType<React.ComponentProps<AppType> & TheAppProps>) =>
        function EnhanceApp(props: AppProps) {
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
