import { Container, Divider, Grid, Typography } from "@mui/material";
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
            <Typography variant="h4" sx={{ color: "#272f5f9c" }}>
              I do many diffrent things. You can find about some of them on this
              site.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  </Box>
);

export default HomePageContent;
