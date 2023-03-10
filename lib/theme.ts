import { createTheme, responsiveFontSizes } from "@mui/material/styles";

let theme = createTheme({
  palette: {
    background: {
      paper: "#c3c2fb",
      default: "#c3c2fb",
    },
  },
  typography: {
    h1: {
      fontWeight: 300,
    },
    fontFamily: "Quicksand-Book, Roboto, Helvetica, system, sans-serif",
  },
  zIndex: {
    drawer: 1100,
    appBar: 1200,
  },
});

theme = responsiveFontSizes(theme);

export default theme;
