import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Container, AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Avatar,
} from '@mui/material';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { logout, selectUser } from '../store/authSlice';

function MainLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector(selectUser);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky">
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontWeight: 700, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            Medica
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                color="inherit"
                onClick={() => navigate('/dashboard/patient')}
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Dashboard
              </Button>
              <IconButton onClick={handleMenu} color="inherit">
                <Avatar
                  src={user.avatar || undefined}
                  sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: 14 }}
                >
                  {!user.avatar && (user.first_name?.[0] || '')}{!user.avatar && (user.last_name?.[0] || '')}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem disabled sx={{ opacity: '1 !important' }}>
                  <Typography variant="body2" fontWeight="bold">
                    {user.first_name} {user.last_name}
                  </Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => { handleClose(); navigate('/profile/patient'); }}
                  selected={location.pathname === '/profile/patient'}
                >
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}

export default MainLayout;
