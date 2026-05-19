import { Outlet, Navigate } from 'react-router';
import { Box, Container, Paper, Typography } from '@mui/material';
import { useAppSelector } from '~/store/hooks';

export default function AuthLayout() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" align="center" color="primary" gutterBottom>
            Medica
          </Typography>
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
}
