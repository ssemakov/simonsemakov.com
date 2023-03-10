import { Grid } from "@mui/material";
import HomePageContent from "../components/HomePageContent";
import Sidebar from "../components/Sidebar";

interface LayoutProps {
  leftPaine: React.FC;
  rightPaine: React.FC;
}

function Layout({ leftPaine: LeftPaine, rightPaine: RightPaine }: LayoutProps) {
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
