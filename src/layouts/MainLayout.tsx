import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Navbar from '../components/shared/Navbar';
import Sidebar from '../components/shared/Sidebar';
import Footer from '../components/shared/Footer';

const DRAWER_WIDTH = 240;

function MainLayout({ children }: { children?: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Navbar onSidebarToggle={handleDrawerToggle} />
      </Box>

      <Box sx={{ display: 'flex', flexGrow: 1, pt: '64px' }}>
        <Sidebar
          open={isDesktop ? true : mobileOpen}
          onClose={handleDrawerToggle}
          variant={isDesktop ? 'permanent' : 'temporary'}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)`, xs: '100%' },
            minWidth: 0,
            backgroundColor: '#f9fafb',
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            {children ?? <Outlet />}
          </Box>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;
