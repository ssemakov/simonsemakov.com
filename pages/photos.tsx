import Grid from "@mui/material/Grid2";
import PhotoAlbums from "../components/PhotoAlbums";
import Sidebar from "../components/Sidebar";

interface LayoutProps {
  leftPaine: React.FC;
  rightPaine: React.FC;
}

function Layout({ leftPaine: LeftPaine, rightPaine: RightPaine }: LayoutProps) {
  return (
    <Grid container>
      <Grid size={10}>
        <LeftPaine />
      </Grid>
      <Grid size={2}>
        <RightPaine />
      </Grid>
    </Grid>
  );
}

export default function DefaultLayout() {
  return <Layout leftPaine={PhotoAlbums} rightPaine={Sidebar} />;
}
