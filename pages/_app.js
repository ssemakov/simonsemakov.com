import Head from "next/head";
import Script from "next/script";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import { config } from "@fortawesome/fontawesome-svg-core";
import DefaultLayout from "../components/DefaultLayout";
import theme from "../lib/theme";
import createEmotionCache from "../lib/emotionCache";
import styles from "../styles/globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";

config.autoAddCss = false;

const ViewportMetaLink = () => (
  <meta name="viewport" content="width=device-width, initial-scale=1" />
);

const clientSideEmotionCache = createEmotionCache();

export default function HomePage() {
  return (
    <>
      <Head>
        <ViewportMetaLink />
      </Head>
      <CacheProvider value={clientSideEmotionCache}>
        <ThemeProvider theme={theme}>
          <CssBaseline enableColorScheme />
          <DefaultLayout />
        </ThemeProvider>
      </CacheProvider>
    </>
  );
}
