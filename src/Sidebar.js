import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AppBar, Drawer, IconButton, Toolbar } from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import SiteMenu from "./SiteMenu";

const BarsIcon = () => <FontAwesomeIcon icon={faBars} />;
const XMarkIcon = () => <FontAwesomeIcon icon={faXmark} />;

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
          <SiteMenu />
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
          <SiteMenu />
        </Drawer>
      </Box>
    </Box>
  );
};

export default ResponsiveSidebar;
