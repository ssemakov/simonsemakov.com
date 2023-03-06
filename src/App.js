import { Grid } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/system";
import "./App.css";
import HomePageContent from "./HomePageContent";
import Sidebar from "./Sidebar";
import theme from "./theme";

const Layout = ({ leftPaine: LeftPaine, rightPaine: RightPaine }) => (
  <Box
    sx={{
      height: "100vh",
    }}
  >
    <Grid container>
      <Grid item md={8}>
        <LeftPaine />
      </Grid>
      <Grid item md={4}>
        <RightPaine />
      </Grid>
    </Grid>
  </Box>
);

const App = () => (
  <>
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <Layout leftPaine={HomePageContent} rightPaine={Sidebar} />
    </ThemeProvider>
  </>
);

export default App;
