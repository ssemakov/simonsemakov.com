import { createTheme, responsiveFontSizes } from "@mui/material/styles";

let theme = createTheme({
  typography: {
    h1: {
      fontWeight: 300,
    },
    fontFamily: "Quicksand-Book, Roboto, Helvetica, system, sans-serif",
  },
});

theme = responsiveFontSizes(theme);

export default theme;
