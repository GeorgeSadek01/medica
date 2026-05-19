import type { ReactNode } from 'react';
import { Outlet, Navigate } from 'react-router';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { logout } from '~/store/authSlice';
import { useNavigate } from 'react-router';
import type { UserRole } from '~/lib/auth';

const DRAWER_WIDTH = 240;

const roleRoutes: Record<UserRole, { label: string; path: string; icon: ReactNode }[]> = {
  patient: [
    { label: 'Dashboard', path: '/dashboard/patient', icon: <DashboardIcon /> },
    { label: 'Profile', path: '/dashboard/patient/profile', icon: <PersonIcon /> },
  ],
  doctor: [
    { label: 'Dashboard', path: '/dashboard/doctor', icon: <DashboardIcon /> },
    { label: 'Profile', path: '/dashboard/doctor/profile', icon: <PersonIcon /> },
  ],
  admin: [
    { label: 'Dashboard', path: '/dashboard/admin', icon: <DashboardIcon /> },
    { label: 'Users', path: '/dashboard/admin/users', icon: <PersonIcon /> },
  ],
};

export default function MainLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const role = user?.role || 'patient';
  const navItems = roleRoutes[role] || [];

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" color="primary" fontWeight="bold">
          Medica
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItemButton key={item.path} onClick={() => { navigate(item.path); setMobileOpen(false); }}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <List>
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Welcome, {user?.first_name} {user?.last_name}
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, textTransform: 'capitalize' }}>
            {user?.role}
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
