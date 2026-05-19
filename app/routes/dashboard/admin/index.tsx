import { Box, Typography, Paper } from '@mui/material';
import { useAppSelector } from '~/store/hooks';

export default function AdminDashboard() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Welcome, {user?.first_name} {user?.last_name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your admin dashboard is ready. Here you will be able to manage users, view system
          statistics, and configure settings.
        </Typography>
      </Paper>
    </Box>
  );
}
