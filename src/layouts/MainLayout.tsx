import { Outlet, useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Container, AppBar, Toolbar, Typography, Button, Link } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store';
import { logout, selectUser } from '../store/authSlice';

function MainLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const getProfilePath = () => {
    if (user?.role === 'doctor') {
      return '/doctor/profile';
    }
    return '/patient/profile';
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Medica
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Link
                component={RouterLink}
                to={getProfilePath()}
                color="inherit"
                underline="hover"
                sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 500, cursor: 'pointer' }}
              >
                {user.first_name} {user.last_name}
              </Link>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
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
