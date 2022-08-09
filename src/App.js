import { Grid } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { Box, Container } from "@mui/system";
import "./App.css";
import GradientTypography from "./GradientTypography";
import theme from "./theme";

const App = () => (
  <>
    <CssBaseline enableColorScheme />
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          backgroundColor: "#2625ec47",
          // backgroundImage: "linear-gradient(135deg, #0f2f79, #3f51b529)",
          height: "100vh",
        }}
      >
        <Grid container>
          <Grid item sm={8}>
            <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="sm">
              <GradientTypography variant="h1">
                Hello
                <br />
                My name is Simon
              </GradientTypography>
              <hr />
              <p>
                I do many diffrent things. You can find about some of them on
                this site.
              </p>
            </Container>
          </Grid>
          <Grid item sm={4}>
            Side bar here
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  </>
);

export default App;
