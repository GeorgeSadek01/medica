import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import adminService from '../services/admin.service';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, appointments: 0, specialties: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [users, appointments, specialties] = await Promise.all([
          adminService.getAllUsers().catch(() => []),
          adminService.getAllAppointments().catch(() => []),
          adminService.getSpecialties().catch(() => []),
        ]);
        setStats({
          users: (users as any[]).length,
          appointments: (appointments as any[]).length,
          specialties: (specialties as any[]).length,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}
      >
        <CircularProgress size={45} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 4 }}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Card elevation={2} sx={{ borderLeft: '6px solid #1976d2', borderRadius: 4 }}>
            <CardContent
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 2.5,
              }}
            >
              <Box>
                <Typography
                  color="text.secondary"
                  variant="subtitle2"
                  sx={{ fontWeight: 700, textTransform: 'uppercase' }}
                >
                  Total Users
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 0.5, color: '#1976d2' }}>
                  {stats.users}
                </Typography>
              </Box>
              <PeopleIcon sx={{ fontSize: 40, color: '#1976d2', opacity: 0.7 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card elevation={2} sx={{ borderLeft: '6px solid #2e7d32', borderRadius: 4 }}>
            <CardContent
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 2.5,
              }}
            >
              <Box>
                <Typography
                  color="text.secondary"
                  variant="subtitle2"
                  sx={{ fontWeight: 700, textTransform: 'uppercase' }}
                >
                  Appointments
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 0.5, color: '#2e7d32' }}>
                  {stats.appointments}
                </Typography>
              </Box>
              <CalendarMonthIcon sx={{ fontSize: 40, color: '#2e7d32', opacity: 0.7 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card elevation={2} sx={{ borderLeft: '6px solid #9c27b0', borderRadius: 4 }}>
            <CardContent
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 2.5,
              }}
            >
              <Box>
                <Typography
                  color="text.secondary"
                  variant="subtitle2"
                  sx={{ fontWeight: 700, textTransform: 'uppercase' }}
                >
                  Specialties
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 0.5, color: '#9c27b0' }}>
                  {stats.specialties}
                </Typography>
              </Box>
              <MedicalServicesIcon sx={{ fontSize: 40, color: '#9c27b0', opacity: 0.7 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
