import { Container } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Box } from "@mui/system";
import GradientTypography from "./GradientTypography";

const HomePageContent = () => (
  <Box className="full-height" display="flex">
    <Box m="auto">
      <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="lg">
        <Grid container direction="column" spacing={2}>
          <Grid size={{ md: 11 }}>
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
