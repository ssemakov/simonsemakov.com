import { Container, Grid, Stack } from "@mui/material";
import { Box } from "@mui/system";
import GradientTypography from "./GradientTypography";

const GitHubIcon = () => <i class="menu-icons fa-brands fa-github" />;
const TwitterIcon = () => <i class="menu-icons fa-brands fa-twitter" />;
const KeyBase = () => <i class="menu-icons fa-brands fa-keybase"></i>;

export const IconsRow = () => (
  <Grid container justifyContent="center" spacing={4}>
    <Grid item>
      <GitHubIcon />
    </Grid>
    <Grid item>
      <TwitterIcon />
    </Grid>
    <Grid item>
      <KeyBase />
    </Grid>
  </Grid>
);

const MenuItems = () => (
  <Box sx={{ height: "70vh" }} display="flex">
    <Box m="auto">
      <Container>
        <Stack spacing={4}>
          <GradientTypography variant="h4">Menu Item One</GradientTypography>
        </Stack>
      </Container>
    </Box>
  </Box>
);

const SiteMenu = () => (
  <>
    <IconsRow />
    <MenuItems />
  </>
);

export default SiteMenu;
