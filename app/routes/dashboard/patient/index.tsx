import { Box, Typography, Paper } from '@mui/material';
import { useAppSelector } from '~/store/hooks';

export default function PatientDashboard() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Patient Dashboard
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Welcome, {user?.first_name} {user?.last_name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your patient dashboard is ready. Here you will be able to manage your appointments, view
          medical records, and more.
        </Typography>
      </Paper>
    </Box>
  );
}
