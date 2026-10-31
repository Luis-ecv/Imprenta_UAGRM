import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import {
  Sidebar,
  SIDEBAR_EXPANDED_WIDTH,
  SIDEBAR_COLLAPSED_WIDTH,
} from './Sidebar';
import { Navbar } from './Navbar';
import { Breadcrumbs } from './Breadcrumbs';
import { Footer } from './Footer';
import { UAGRM_COLORS } from '@/theme/uagrmTheme';

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  const handleToggleCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  const currentSidebarWidth = collapsed
    ? SIDEBAR_COLLAPSED_WIDTH
    : SIDEBAR_EXPANDED_WIDTH;

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: UAGRM_COLORS.background.default,
      }}
    >
      {/* Sidebar con soporte de colapso y modo responsive */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={handleMobileClose}
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Área Principal de Contenido */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          width: { md: `calc(100% - ${currentSidebarWidth}px)` },
          transition: 'width 0.24s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Navbar onDrawerToggle={handleDrawerToggle} drawerWidth={currentSidebarWidth} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            px: { xs: 2, sm: 3, md: 4 },
            pt: 2,
            pb: 2,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              maxWidth: 1400,
              mx: 'auto',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
            }}
          >
            <Breadcrumbs />
            <Box sx={{ flexGrow: 1 }}>
              <Outlet />
            </Box>
            <Footer />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default AppLayout;
