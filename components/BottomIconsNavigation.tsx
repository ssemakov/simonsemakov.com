import { Grid, Link } from "@mui/material";
import { Box } from "@mui/system";
import { GitHubIcon, InstagramIcon, KeyBaseIcon, TwitterIcon } from "./icons";

const BottomIconNavigation = () => (
  <Box
    sx={{ margin: "2em", position: "absolute", bottom: 0, left: 0, right: 0 }}
  >
    <Grid container direction="row" justifyContent="center" spacing={6}>
      <Grid item>
        <Link
          href="https://github.com/ssemakov"
          rel="noopener"
          target="_blank"
          underline="hover"
          aria-label="Visit Simon's GitHub profile which opens in a new window."
        >
          <GitHubIcon />
        </Link>
      </Grid>
      <Grid item>
        <Link
          href="https://twitter.com/ssemakov"
          rel="noopener"
          target="_blank"
          aria-label="Visit Simon's Twitter which opens in a new window."
        >
          <TwitterIcon />
        </Link>
      </Grid>
      <Grid item>
        <Link
          href="https://keybase.io/ssemakov"
          rel="noopener"
          target="_blank"
          aria-label="Visit Simon's Keybase profile which opens in a new window."
        >
          <KeyBaseIcon />
        </Link>
      </Grid>
      <Grid item>
        <Link
          href="https://instagram.com/ssemakov"
          rel="noopener"
          target="_blank"
          aria-label="Visit Simon's Instagram profile which opens in a new window."
        >
          <InstagramIcon />
        </Link>
      </Grid>
    </Grid>
  </Box>
);

export default BottomIconNavigation;
