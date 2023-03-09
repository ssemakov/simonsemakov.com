import { Grid } from "@mui/material";
import HomePageContent from "./HomePageContent";
import Sidebar from "./Sidebar";

function Layout({ leftPaine: LeftPaine, rightPaine: RightPaine }) {
  return (
    <Grid container>
      <Grid item md={8}>
        <LeftPaine />
      </Grid>
      <Grid item md={4}>
        <RightPaine />
      </Grid>
    </Grid>
  );
}

export default function DefaultLayout() {
  return <Layout leftPaine={HomePageContent} rightPaine={Sidebar} />;
}
