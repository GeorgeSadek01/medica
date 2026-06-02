import { Outlet, Link as RouterLink } from 'react-router-dom';
import { Box, Paper, Typography, Container } from '@mui/material';
import { Link as MuiLink } from '@mui/material';

function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="xs">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <MuiLink
            component={RouterLink}
            to="/"
            underline="none"
            color="inherit"
            sx={{
              fontWeight: 800,
              fontSize: '1.75rem',
              letterSpacing: '-0.5px',
              transition: 'all 0.2s ease',
              display: 'block',
              textAlign: 'center',
              mb: 0.35,
              '&:hover': { color: 'primary.main', transform: 'scale(1.03)' },
            }}
          >
            Medica
          </MuiLink>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Your healthcare management platform
          </Typography>
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
}

export default AuthLayout;
