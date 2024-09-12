import { Box, Container } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import Sidebar from "../../components/Sidebar";

const Istanbul = () => {
  const [windowHeight, setWindowHeight] = useState(650);
  const handleResize = () => {
    setWindowHeight(window.innerHeight - 100);
  };
  useEffect(() => {
    window.addEventListener("resize", handleResize, false);
  }, []);

  return (
    <Box sx={{ height: `${windowHeight}px` }}>
      <iframe
        src="https://www.playbook.com/e/simons83/s6arErSms7dmM6w5VdrznbWa?theme=gallery"
        title="Istanbul"
        sandbox="allow-same-origin allow-scripts"
        frameBorder="0"
        width="100%"
        height="100%"
      ></iframe>
    </Box>
  );
};

const PhotoAlbumContainer = () => (
  <Container maxWidth="xl" sx={{ height: "100%" }}>
    <Box sx={{ m: 8, justifySelf: "center" }}>
      <Grid container>
        <Grid size={{ sm: 12, md: 8, lg: 10 }}>
          <Istanbul />
        </Grid>
      </Grid>
    </Box>
  </Container>
);

export default function DefaultLayout() {
  return <Layout leftPaine={PhotoAlbumContainer} rightPaine={Sidebar} />;
}
