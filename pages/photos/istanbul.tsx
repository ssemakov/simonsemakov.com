import { Box, Container } from "@mui/material";
import Grid from "@mui/material/Grid2";
import Layout from "../../components/Layout";
import Sidebar from "../../components/Sidebar";

const Istanbul = () => (
  <div style={{ height: "1500px" }}>
    <iframe
      src="https://www.playbook.com/e/simons83/s6arErSms7dmM6w5VdrznbWa?theme=gallery"
      title="Istanbul"
      sandbox="allow-same-origin allow-scripts"
      frameBorder="0"
      width="100%"
      height="100%"
    ></iframe>
  </div>
);

const PhotoAlbumContainer = () => (
  <Container fixed maxWidth="xl">
    <Box sx={{ m: 8 }} />
    <Grid container spacing={2} columns={12}>
      <Grid size={{ sm: 12, md: 8, lg: 10 }}>
        <Istanbul />
      </Grid>
    </Grid>
  </Container>
);

export default function DefaultLayout() {
  return <Layout leftPaine={PhotoAlbumContainer} rightPaine={Sidebar} />;
}
