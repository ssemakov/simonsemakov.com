import {
  AppBar,
  Container,
  Drawer,
  Grid,
  IconButton,
  Stack,
  Toolbar,
} from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import GradientTypography from "./GradientTypography";
import SiteMenu from "./SiteMenu";

const BarsIcon = () => <i class="fa-solid fa-bars"></i>;
const XMarkIcon = () => <i class="fa-solid fa-xmark"></i>;

/// temp
const GitHubIcon = () => <i class="menu-icons fa-brands fa-github" />;
const TwitterIcon = () => <i class="menu-icons fa-brands fa-twitter" />;
const KeyBase = () => <i class="menu-icons fa-brands fa-keybase"></i>;
///

const drawerToggleButton = (Icon, direction) => (props) =>
  (
    <IconButton
      color="inherit"
      aria-label={`${direction} drawer`}
      edge="end"
      {...props}
      sx={{ ml: { xs: 1 }, display: { md: "none" } }}
    >
      <Icon />
    </IconButton>
  );

const OpenDrawerButton = drawerToggleButton(BarsIcon, "open");
const CloseDrawerButton = drawerToggleButton(XMarkIcon, "close");

const ResponsiveSidebar = (props) => {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(true);
  const container =
    window !== undefined ? () => window().document.body : undefined;

  // 400 suites well both iPhone 12 and iPad Air vertical screens
  // I may need to do more granular steps to accommodate more different screen sizes aesthetics
  const drawerWidth = 400;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <Box
            m={1}
            display="flex"
            justifyContent="flex-end"
            alignItems="flex-end"
            sx={{ width: "100%" }}
          >
            {mobileOpen ? (
              <CloseDrawerButton onClick={handleDrawerToggle} />
            ) : (
              <OpenDrawerButton onClick={handleDrawerToggle} />
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          anchor="right"
          sx={{
            display: { xs: "block", sm: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          <Box sx={{ margin: "8em 0" }}>
            <SiteMenu />
          </Box>
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              borderLeftWidth: 0,
              width: drawerWidth,
            },
          }}
          anchor="right"
          open
        >
          <>
            <Box sx={{ height: "70vh" }} display="flex">
              <Box m="auto">
                <MenuItems />
              </Box>
            </Box>
            <Grid container direction="column" justifyContent="flex-end">
              <Grid item>
                {/* /// maybe push them into footer for both mobile and desktop */}
                <Icons />
              </Grid>
            </Grid>
          </>
        </Drawer>
      </Box>
    </Box>
  );
};

const Icons = () => (
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
  <Container>
    <Stack spacing={4}>
      <GradientTypography variant="h4">Menu Item One</GradientTypography>
    </Stack>
  </Container>
);

export default ResponsiveSidebar;
