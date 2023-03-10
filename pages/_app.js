import Head from "next/head";
import Script from "next/script";
import React from "react";

import { CacheProvider } from "@emotion/react";
import { config } from "@fortawesome/fontawesome-svg-core";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";

import DefaultLayout from "../components/DefaultLayout";
import createEmotionCache from "../lib/emotionCache";
import theme from "../lib/theme";

import "@fortawesome/fontawesome-svg-core/styles.css";
import styles from "../styles/globals.css";

config.autoAddCss = false;

const ViewportMetaLink = () => (
  <meta name="viewport" content="width=device-width, initial-scale=1" />
);

const clientSideEmotionCache = createEmotionCache();

export default function HomePage() {
  return (
    <>
      <React.StrictMode>
        <Head>
          <ViewportMetaLink />
        </Head>
        <CacheProvider value={clientSideEmotionCache}>
          <ThemeProvider theme={theme}>
            <CssBaseline enableColorScheme />
            <DefaultLayout />
          </ThemeProvider>
        </CacheProvider>
      </React.StrictMode>
    </>
  );
}
