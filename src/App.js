import { Grid, Typography } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import {
  createTheme,
  responsiveFontSizes,
  ThemeProvider,
} from "@mui/material/styles";
import { Box, Container } from "@mui/system";
import "./App.css";

let theme = createTheme();
theme = responsiveFontSizes(theme);

const App = () => (
  <>
    <CssBaseline enableColorScheme />
    <ThemeProvider theme={theme}></ThemeProvider>
    <Box
      sx={{
        background:
          "linear-gradient(to bottom, rgb(35, 41, 162), rgb(147, 151, 231))",
        height: "100vh",
      }}
    >
      <Grid container>
        <Grid item sm={8}>
          <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="sm">
            <Typography variant="h1">Hello</Typography>
            <Typography variant="h1">My name is Simon</Typography>
            <hr />
            <p>
              I do many diffrent things. You can find about some of them on this
              site.
            </p>
          </Container>
        </Grid>
        <Grid item sm={4}>
          Side bar here
        </Grid>
      </Grid>
    </Box>
  </>
);

export default App;
