import { useNavigate } from 'react-router-dom';
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
            sx={{ flexGrow: 1, fontWeight: 700, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            Medica
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
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
      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        {children}
      </Container>
    </Box>
  );
}

export default GuestLayout;
