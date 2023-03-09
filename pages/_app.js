import styles from "./styles/globals.css";
import { Grid } from "@mui/material";
// import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
// import HomePageContent from "./HomePageContent";
// import Sidebar from "./Sidebar";
// import theme from "./theme";

const HomePageLayout = ({ leftPaine: LeftPaine, rightPaine: RightPaine }) => (
  <Grid container>
    <Grid item md={8}>
      <LeftPaine />
    </Grid>
    <Grid item md={4}>
      <RightPaine />
    </Grid>
  </Grid>
);

const HomePageContent = () => <div>Home Page Content</div>;
const Sidebar = () => <div>Sidebar</div>;
const theme = {};

export default function HomePage() {
  return (
    <>
      <ThemeProvider theme={theme}>
        {/* <CssBaseline enableColorScheme /> */}
        <HomePageLayout leftPaine={HomePageContent} rightPaine={Sidebar} />
      </ThemeProvider>
    </>
  );
}
