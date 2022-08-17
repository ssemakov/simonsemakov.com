import { Divider, Grid, Typography } from "@mui/material";
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
          height: "100vh",
        }}
        display="flex"
        height={80}
        alignItems="center"
        justifyContent="center"
      >
        <Grid container>
          <Grid item sm={12}>
            <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="sm">
              <Grid container direction="column" spacing={2}>
                <Grid item>
                  <GradientTypography variant="h1">
                    Hello
                    <br />
                    My name is Simon
                  </GradientTypography>
                </Grid>
                <Grid item>
                  <Grid container>
                    <Grid item sm={1}>
                      <Divider
                        sx={{
                          borderBottomWidth: "thick",
                          borderColor: "#818bc2",
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <Typography variant="h4" sx={{ color: "#272f5f" }}>
                    I do many diffrent things. You can find about some of them
                    on this site.
                  </Typography>
                </Grid>
              </Grid>
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
