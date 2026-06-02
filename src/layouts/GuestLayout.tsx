import { Link, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  Box, AppBar, Toolbar, Typography, Button, Container,
} from '@mui/material';

function GuestLayout({ children }: { children?: ReactNode }) {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky">
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              fontWeight: 800,
              cursor: 'pointer',
              letterSpacing: '-0.5px',
              transition: 'all 0.2s ease',
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': { opacity: 0.85, transform: 'scale(1.03)' },
            }}
          >
            Medica
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button color="inherit" onClick={() => navigate('/find-doctor')}>
              Find Doctors
            </Button>
            <Button color="inherit" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
              onClick={() => navigate('/register')}
            >
              Sign Up
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth={false} disableGutters sx={{ flexGrow: 1, py: 3 }}>
        {children}
      </Container>
    </Box>
  );
}

export default GuestLayout;
