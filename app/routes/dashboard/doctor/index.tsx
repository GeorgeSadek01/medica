import { Box, Typography, Paper } from '@mui/material';
import { useAppSelector } from '~/store/hooks';

export default function DoctorDashboard() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Doctor Dashboard
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Welcome, Dr. {user?.last_name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your doctor dashboard is ready. Here you will be able to manage appointments, view patient
          records, and more.
        </Typography>
      </Paper>
    </Box>
  );
}
