import { Container, Grid } from "@mui/material";
import { Box } from "@mui/system";
import GradientTypography from "./GradientTypography";

const HomePageContent = () => (
  <Box sx={{ height: "100vh" }} display="flex">
    <Box m="auto">
      <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="lg">
        <Grid container direction="column" spacing={2}>
          <Grid item>
            <GradientTypography variant="h1">
              Hello
              <br />
              My name is Simon
            </GradientTypography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  </Box>
);

export default HomePageContent;
