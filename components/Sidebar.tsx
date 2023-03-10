import { AppBar, Drawer, IconButton, Toolbar, IconButtonProps } from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import BottomIconNavigation from "./BottomIconsNavigation";
import SideMenu from "./SideMenu";
import { BarsIcon, XMarkIcon } from "./icons";

const drawerToggleButton = (Icon: React.FC, direction: "open" | "close") =>
  (props: IconButtonProps) =>
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

const Content = () => (
  <Box sx={{ height: "70vh" }} display="flex">
    <Box m="auto">
      <SideMenu />
      <BottomIconNavigation />
    </Box>
  </Box>
);

interface ResponsiveSidebarProps {
  window?: () => Window;
}

const ResponsiveSidebar = ({ window }: ResponsiveSidebarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
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
          <Content />
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
          <Content />
        </Drawer>
      </Box>
    </Box>
  );
};

export default ResponsiveSidebar;
