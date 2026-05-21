import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Navbar from '../components/shared/Navbar';
import Sidebar from '../components/shared/Sidebar';
import Footer from '../components/shared/Footer';

const DRAWER_WIDTH = 240;

function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>

      <Navbar onSidebarToggle={handleDrawerToggle} />

      <Box sx={{ display: 'flex', flexGrow: 1 }}>

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
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Outlet />
          </Box>
          <Footer />
        </Box>

      </Box>
    </Box>
  );
}

export default MainLayout;
