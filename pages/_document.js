import Script from "next/script";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={metadata.description} />
        <meta name="theme-color" content="#000000" />
        <Script src="https://kit.fontawesome.com/306539fa0b.js" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

export const metadata = {
  title: "Simon's page",
  description: "Welcome to my corner of the internet!",
  charset: "utf-8",
  icons: {
    icon: "/favicon.ico",
  },
};
