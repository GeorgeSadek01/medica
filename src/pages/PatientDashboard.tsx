import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PaymentIcon from '@mui/icons-material/Payment';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import appointmentService from '../services/appointment.service';
import { selectUser } from '../store/authSlice';

interface Appointment {
  id: number;
  patient: number;
  doctor: number;
  doctor_name: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
  paid?: boolean;
}

const STATUS_COLORS: Record<string, 'warning' | 'info' | 'success' | 'error'> = {
  pending: 'warning',
  confirmed: 'info',
  completed: 'success',
  cancelled: 'error',
};

function PatientDashboard() {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const all = await appointmentService.getAll();
      setAppointments(all as Appointment[]);
      setLoading(false);
    })();
  }, []);

  const myAppointments = appointments.filter((a) => user && a.patient === user.id);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const total = myAppointments.length;
  const upcoming = myAppointments.filter((a) => {
    const d = new Date(a.date);
    return d >= today && a.status !== 'cancelled';
  });
  const completed = myAppointments.filter((a) => a.status === 'completed');
  const cancelledCount = myAppointments.filter((a) => a.status === 'cancelled').length;
  const pendingPayment = myAppointments.filter((a) => a.status === 'pending' && !a.paid);

  const stats = [
    { label: 'Total Appointments', value: total, icon: <CalendarMonthIcon fontSize="large" />, color: '#1976d2' },
    { label: 'Upcoming', value: upcoming.length, icon: <PendingActionsIcon fontSize="large" />, color: '#ed6c02' },
    { label: 'Completed', value: completed.length, icon: <CheckCircleIcon fontSize="large" />, color: '#2e7d32' },
    { label: 'Cancelled', value: cancelledCount, icon: <CancelIcon fontSize="large" />, color: '#d32f2f' },
    { label: 'Pending Payment', value: pendingPayment.length, icon: <PaymentIcon fontSize="large" />, color: '#9c27b0' },
  ];

  const nextAppointment = upcoming.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )[0];

  const recentAppointments = [...myAppointments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {user ? `Welcome, ${user.first_name ?? user.email}` : 'Patient Dashboard'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage your appointments and health journey
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<LocalHospitalIcon />}
            onClick={() => navigate('/find-doctor')}
          >
            Book Appointment
          </Button>
          <Button
            variant="outlined"
            startIcon={<CalendarMonthIcon />}
            onClick={() => navigate('/appointments/patient')}
          >
            My Appointments
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {stats.map((s) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={s.label}>
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
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                },
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

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {nextAppointment && (
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Next Appointment
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Doctor</Typography>
                  <Typography fontWeight={600}>{nextAppointment.doctor_name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Specialty</Typography>
                  <Typography>{nextAppointment.specialty}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Date</Typography>
                  <Typography>{nextAppointment.date}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Time</Typography>
                  <Typography>{nextAppointment.time}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography color="text.secondary">Status</Typography>
                  <Chip
                    label={nextAppointment.status.charAt(0).toUpperCase() + nextAppointment.status.slice(1)}
                    color={STATUS_COLORS[nextAppointment.status] ?? 'default'}
                    size="small"
                  />
                </Box>
              </Box>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={() => navigate(`/appointments/${nextAppointment.id}`)}
                endIcon={<ArrowForwardIosIcon fontSize="small" />}
                sx={{ mt: 2 }}
              >
                View Details
              </Button>
            </Paper>
          </Grid>
        )}

        <Grid size={{ xs: 12, md: nextAppointment ? 7 : 12 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Recent Appointments
              </Typography>
              {myAppointments.length > 4 && (
                <Button
                  size="small"
                  onClick={() => navigate('/appointments/patient')}
                  endIcon={<ArrowForwardIosIcon fontSize="small" />}
                >
                  View All
                </Button>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />

            {recentAppointments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">No appointments yet.</Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate('/find-doctor')}
                  sx={{ mt: 2 }}
                >
                  Book Your First Appointment
                </Button>
              </Box>
            ) : (
              <Box>
                {recentAppointments.map((a, i) => (
                  <Box
                    key={a.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1.5,
                      cursor: 'pointer',
                      borderRadius: 1,
                      transition: 'background-color 0.15s',
                      '&:hover': { bgcolor: 'action.hover' },
                      px: 1,
                      mx: -1,
                    }}
                    onClick={() => navigate(`/appointments/${a.id}`)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: `${STATUS_COLORS[a.status] ?? 'grey'}.light`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {a.status === 'completed' ? (
                          <CheckCircleIcon fontSize="small" sx={{ color: 'success.dark' }} />
                        ) : a.status === 'cancelled' ? (
                          <CancelIcon fontSize="small" sx={{ color: 'error.dark' }} />
                        ) : (
                          <CalendarMonthIcon fontSize="small" sx={{ color: 'warning.dark' }} />
                        )}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {a.doctor_name || `Appointment #${a.id}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {a.date} &middot; {a.time}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                      {a.paid !== undefined && (
                        <Chip
                          label={a.paid ? 'Paid' : 'Unpaid'}
                          color={a.paid ? 'success' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      <Chip
                        label={a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                        color={STATUS_COLORS[a.status] ?? 'default'}
                        size="small"
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PatientDashboard;
