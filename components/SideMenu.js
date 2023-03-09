import { Container, Stack } from "@mui/material";
import { Box } from "@mui/system";
import GradientTypography from "./GradientTypography";

const SideMenu = () => (
  <Box sx={{ height: "70vh" }} display="flex">
    <Box m="auto">
      <Container>
        <Stack spacing={4}>
          <GradientTypography variant="h4"></GradientTypography>
        </Stack>
      </Container>
    </Box>
  </Box>
);

export default SideMenu;
