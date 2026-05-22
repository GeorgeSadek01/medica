import { useEffect, useState } from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { useSelector } from 'react-redux';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import appointmentService from '../services/appointment.service';
import { selectUser } from '../store/authSlice';

interface Appointment {
  id: number;
  patient: number;
  date: string;
  status: string;
}

function PatientDashboard() {
  const user = useSelector(selectUser);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    (async () => {
      const all = await appointmentService.getAll();
      setAppointments(all as Appointment[]);
    })();
  }, []);

  const myAppointments = appointments.filter((a) => user && a.patient === user.id);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const total = myAppointments.length;
  const upcoming = myAppointments.filter((a) => {
    const d = new Date(a.date);
    return d >= today && a.status !== 'cancelled';
  }).length;
  const completed = myAppointments.filter((a) => a.status === 'completed').length;
  const cancelled = myAppointments.filter((a) => a.status === 'cancelled').length;
  const pendingPayment = myAppointments.filter((a) => a.status === 'pending').length;

  const stats = [
    { label: 'Total Appointments', value: total, icon: <CalendarMonthIcon />, color: '#1976d2' },
    { label: 'Upcoming', value: upcoming, icon: <PendingActionsIcon />, color: '#ed6c02' },
    { label: 'Completed', value: completed, icon: <CheckCircleIcon />, color: '#2e7d32' },
    { label: 'Cancelled', value: cancelled, icon: <CancelIcon />, color: '#d32f2f' },
    { label: 'Pending Payment', value: pendingPayment, icon: <PendingActionsIcon />, color: '#9c27b0' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {user ? `Welcome, ${user.first_name ?? user.email}` : 'Patient Dashboard'}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {stats.map((s) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={s.label}>
            <Paper
              sx={{
                p: 2.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                borderTop: 4,
                borderColor: s.color,
                borderRadius: 2,
              }}
              elevation={2}
            >
              <Box sx={{ color: s.color }}>{s.icon}</Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {s.value}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                {s.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default PatientDashboard;
