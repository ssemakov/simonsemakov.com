import { createTheme, responsiveFontSizes } from "@mui/material/styles";

let theme = createTheme({
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
  components: {
    MuiLink: {
      styleOverrides: {
        root: {
          color: "#4e5a9e",
          "&:hover": {
            color: "#353e72",
          },
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
