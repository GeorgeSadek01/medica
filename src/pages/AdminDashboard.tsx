import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, CircularProgress,
  Chip, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Alert, Button, LinearProgress,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import VerifiedIcon from '@mui/icons-material/Verified';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

import adminService from '../services/admin.service';

interface DashboardStats {
  users: { total: number; patients: number; doctors: number; unverified_doctors: number };
  appointments: { total: number; pending: number; confirmed: number; completed: number; cancelled: number };
  specialties: number;
  recent_appointments: Array<{
    id: number; doctor_name: string; patient_name: string; date: string; time: string; status: string;
  }>;
}

const STATUS_CHIP: Record<string, { label: string; color: 'warning' | 'success' | 'error' | 'info' }> = {
  pending: { label: 'Pending', color: 'warning' },
  confirmed: { label: 'Confirmed', color: 'success' },
  completed: { label: 'Completed', color: 'info' },
  cancelled: { label: 'Cancelled', color: 'error' },
};

const APPT_BAR: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: '#ed6c02' },
  confirmed: { label: 'Confirmed', color: '#2e7d32' },
  completed: { label: 'Completed', color: '#0288d1' },
  cancelled: { label: 'Cancelled', color: '#d32f2f' },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={45} />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">Failed to load dashboard data.</Alert>
      </Box>
    );
  }

  const maxApptStatus = Math.max(
    stats.appointments.pending, stats.appointments.confirmed,
    stats.appointments.completed, stats.appointments.cancelled, 1,
  );

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0.5 }}>
        Admin Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Overview of the clinic platform
      </Typography>

      {stats.users.unverified_doctors > 0 && (
        <Alert
          severity="warning"
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button size="small" onClick={() => navigate('/admin/users')}>
              Review Doctors
            </Button>
          }
        >
          <strong>{stats.users.unverified_doctors}</strong> doctor{' '}
          {stats.users.unverified_doctors === 1 ? 'is' : 'are'} pending verification.
        </Alert>
      )}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card elevation={2} sx={{ borderRadius: 3, borderLeft: '5px solid #1976d2' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
              <Box>
                <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  Total Users
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  {stats.users.total}
                </Typography>
              </Box>
              <PeopleIcon sx={{ fontSize: 36, color: '#1976d2', opacity: 0.6 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card elevation={2} sx={{ borderRadius: 3, borderLeft: '5px solid #1565c0' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
              <Box>
                <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  Patients
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1565c0' }}>
                  {stats.users.patients}
                </Typography>
              </Box>
              <PersonIcon sx={{ fontSize: 36, color: '#1565c0', opacity: 0.6 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card elevation={2} sx={{ borderRadius: 3, borderLeft: '5px solid #00897b' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
              <Box>
                <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  Doctors
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#00897b' }}>
                  {stats.users.doctors}
                </Typography>
              </Box>
              <LocalHospitalIcon sx={{ fontSize: 36, color: '#00897b', opacity: 0.6 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 3,
              borderLeft: '5px solid #e65100',
              opacity: stats.users.unverified_doctors > 0 ? 1 : 0.6,
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
              <Box>
                <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  Unverified Doctors
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 'bold', color: stats.users.unverified_doctors > 0 ? '#e65100' : 'text.disabled' }}
                >
                  {stats.users.unverified_doctors}
                </Typography>
              </Box>
              <VerifiedIcon sx={{ fontSize: 36, color: '#e65100', opacity: stats.users.unverified_doctors > 0 ? 0.6 : 0.3 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card elevation={2} sx={{ borderRadius: 3, borderLeft: '5px solid #2e7d32' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
              <Box>
                <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  Appointments
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                  {stats.appointments.total}
                </Typography>
              </Box>
              <CalendarMonthIcon sx={{ fontSize: 36, color: '#2e7d32', opacity: 0.6 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card elevation={2} sx={{ borderRadius: 3, borderLeft: '5px solid #9c27b0' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
              <Box>
                <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  Specialties
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                  {stats.specialties}
                </Typography>
              </Box>
              <MedicalServicesIcon sx={{ fontSize: 36, color: '#9c27b0', opacity: 0.6 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Appointment Status Overview
              </Typography>
              {(['pending', 'confirmed', 'completed', 'cancelled'] as const).map((key) => {
                const count = stats.appointments[key];
                const pct = maxApptStatus > 0 ? Math.round((count / maxApptStatus) * 100) : 0;
                const bar = APPT_BAR[key];
                return (
                  <Box key={key} sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{bar.label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: bar.color }}>{count}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: `${bar.color}20`,
                        '& .MuiLinearProgress-bar': { backgroundColor: bar.color, borderRadius: 4 },
                      }}
                    />
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button variant="outlined" fullWidth onClick={() => navigate('/admin/users')} sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                  <PeopleIcon sx={{ mr: 1, fontSize: 20 }} /> Manage Users
                </Button>
                <Button variant="outlined" fullWidth onClick={() => navigate('/admin/appointments')} sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                  <CalendarMonthIcon sx={{ mr: 1, fontSize: 20 }} /> View All Appointments
                </Button>
                <Button variant="outlined" fullWidth onClick={() => navigate('/admin/specialties')} sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                  <MedicalServicesIcon sx={{ mr: 1, fontSize: 20 }} /> Manage Specialties
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Recent Appointments
                </Typography>
                <Button size="small" onClick={() => navigate('/admin/appointments')}>
                  View All
                </Button>
              </Box>
              {stats.recent_appointments.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  No appointments yet.
                </Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Patient</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Doctor</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.recent_appointments.map((appt) => {
                        const chip = STATUS_CHIP[appt.status] || { label: appt.status, color: 'default' as const };
                        return (
                          <TableRow key={appt.id} hover>
                            <TableCell>{appt.patient_name}</TableCell>
                            <TableCell>{appt.doctor_name}</TableCell>
                            <TableCell>{appt.date}</TableCell>
                            <TableCell>{appt.time}</TableCell>
                            <TableCell>
                              <Chip label={chip.label} color={chip.color} size="small" sx={{ fontWeight: 600 }} />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
