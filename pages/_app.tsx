import Head from "next/head";
import React from "react";
import { AppProps } from 'next/app';

import { CacheProvider, EmotionCache } from "@emotion/react";
import { config } from "@fortawesome/fontawesome-svg-core";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";

import createEmotionCache from "../lib/emotionCache";
import theme from "../lib/theme";

import "@fortawesome/fontawesome-svg-core/styles.css";
require("../styles/globals.css");

config.autoAddCss = false;

const ViewportMetaLink = () => (
  <meta name="viewport" content="width=device-width, initial-scale=1" />
);

const clientSideEmotionCache = createEmotionCache();

export interface TheAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function TheApp(props: TheAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  return (
    <>
      <React.StrictMode>
        <Head>
          <ViewportMetaLink />
        </Head>
        <CacheProvider value={emotionCache}>
          <ThemeProvider theme={theme}>
            <CssBaseline enableColorScheme />
            <Component {...pageProps} />
          </ThemeProvider>
        </CacheProvider>
      </React.StrictMode>
    </>
  );
}
