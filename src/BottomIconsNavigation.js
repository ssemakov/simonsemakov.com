import { Grid } from "@mui/material";
import { Box } from "@mui/system";

const GitHubIcon = () => <i class="menu-icons fa-brands fa-github" />;
const TwitterIcon = () => <i class="menu-icons fa-brands fa-twitter" />;
const KeyBase = () => <i class="menu-icons fa-brands fa-keybase"></i>;

const BottomIconNavigation = () => (
  <Box
    sx={{ margin: "2em", position: "absolute", bottom: 0, left: 0, right: 0 }}
  >
    <Grid container direction="row" justifyContent="center" spacing={6}>
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
  </Box>
);

export default BottomIconNavigation;
