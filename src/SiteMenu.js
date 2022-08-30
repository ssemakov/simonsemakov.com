import { Container, Stack } from "@mui/material";
import { Box } from "@mui/system";

const SiteMenu = () => (
  <Box sx={{ height: "60vh" }} display="flex">
    <Box m="auto">
      <Container>
        <Stack spacing={4}>
          <span>Menu Item One</span>
          <span> Menu Item Two</span>
          <span> Menu Item Three</span>
        </Stack>
      </Container>
    </Box>
  </Box>
);

export default SiteMenu;
