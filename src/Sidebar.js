import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AppBar, Drawer, Grid, IconButton, Toolbar } from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import sidebarContent from "./sidebarContent";

const MenuIcon = () => <FontAwesomeIcon icon={faBars} />;
const CloseMenuIcon = () => <FontAwesomeIcon icon={faXmark} />;

const OpenMenuButton = (props) => (
  <IconButton
    color="inherit"
    aria-label="open drawer"
    edge="end"
    {...props}
    sx={{ ml: { xs: 1 }, display: { md: "none" } }}
  >
    <MenuIcon />
  </IconButton>
);

const CloseMenuButton = (props) => (
  <IconButton
    color="inherit"
    aria-label="close drawer"
    edge="end"
    {...props}
    sx={{ ml: { xs: 1 }, display: { md: "none" } }}
  >
    <CloseMenuIcon />
  </IconButton>
);

const ResponsiveSidebar = (props) => {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(true);
  const container =
    window !== undefined ? () => window().document.body : undefined;
  const drawerWidth = 300;

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
          {/* // get rid of the grid  it doesn't play well with the responsivness  */}
          <Grid container direction="row">
            <Grid item xs={11} />
            <Grid item xs={1}>
              {mobileOpen ? (
                <CloseMenuButton onClick={handleDrawerToggle} />
              ) : (
                <OpenMenuButton onClick={handleDrawerToggle} />
              )}
            </Grid>
          </Grid>
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
          {sidebarContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          anchor="right"
          open
        >
          {sidebarContent}
        </Drawer>
      </Box>
    </Box>
  );
};

export default ResponsiveSidebar;
