import { Container, Stack } from "@mui/material";
import { Box } from "@mui/system";
import GradientTypography from "./GradientTypography";

const GitHubIcon = () => <i class="menu-icons fa-brands fa-github" size="22" />;

const SiteMenu = () => (
  <Box sx={{ height: "70vh" }} display="flex">
    <Box m="auto">
      <Container>
        <Stack spacing={4}>
          <GitHubIcon />
          <GradientTypography variant="h4">Menu Item One</GradientTypography>
        </Stack>
      </Container>
    </Box>
  </Box>
);

export default SiteMenu;
