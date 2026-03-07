import { Box } from "@mui/material";
import Grid from "@mui/material/Grid2";

interface LayoutProps {
  leftPaine: React.FC;
  rightPaine: React.FC;
}

export default function Layout({
  leftPaine: LeftPaine,
  rightPaine: RightPaine,
}: LayoutProps) {
  return (
    <Grid container>
      <Grid size={{ xs: 12, sm: 12, md: 10 }}>
        <Box pt={{ xs: 4, md: 4 }}>
          <LeftPaine />
        </Box>
      </Grid>
      <Grid size={{ xs: 0, sm: 0, md: 2 }}>
        <RightPaine />
      </Grid>
    </Grid>
  );
}
