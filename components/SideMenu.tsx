import { Container, Link, Stack } from "@mui/material";
import { Box } from "@mui/system";
import GradientTypography from "./GradientTypography";

const SideMenu = () => (
  <Box sx={{ height: "70vh" }} display="flex">
    <Box m="auto">
      <Container>
        <Stack spacing={4}>
          <Link href="/" aria-label="Navigation to photography page.">
            <GradientTypography variant="h4">about me</GradientTypography>
          </Link>
          <Link href="/photos" aria-label="Navigation to photography page.">
            <GradientTypography variant="h4">photography</GradientTypography>
          </Link>
        </Stack>
      </Container>
    </Box>
  </Box>
);

export default SideMenu;
