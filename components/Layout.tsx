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
        <LeftPaine />
      </Grid>
      <Grid size={{ xs: 0, sm: 0, md: 2 }}>
        <RightPaine />
      </Grid>
    </Grid>
  );
}
