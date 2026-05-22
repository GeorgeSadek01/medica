import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';

import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DescriptionIcon from '@mui/icons-material/Description';

import appointmentService from '../services/appointment.service';
import doctorService from '../services/doctor.service';
import { useAppSelector } from '../store';
import { selectAuth } from '../store/authSlice';

interface Appointment {
  id: number;
  doctor: number;
  doctor_name: string;
  patient: number;
  patient_name: string;
  date: string;
  time: string;
  time_slot: number;
  status: string;
  notes: string;
  doctor_notes: string;
}

export default function DoctorDashboardPage() {
  const { user } = useAppSelector(selectAuth);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorName, setDoctorName] = useState('Doctor');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const allAppointments = await appointmentService.getAll().catch(() => []);
      const allDoctors = await doctorService.getAll().catch(() => []);

      const currentDoctor = allDoctors.find(
        (d) =>
          d.contact === user?.email ||
          `${d.first_name} ${d.last_name}` === `${user?.first_name} ${user?.last_name}`,
      );

      if (currentDoctor) {
        setDoctorName(`Dr. ${currentDoctor.first_name} ${currentDoctor.last_name}`);
        const doctorAppointments = allAppointments.filter(
          (app) => Number(app.doctor) === Number(currentDoctor.id),
        );
        setAppointments(doctorAppointments);
      } else {
        setAppointments(allAppointments);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const totalBookings = appointments.length;
  const confirmedAppointments = appointments.filter(
    (a) => a.status === 'confirmed' || a.status === 'completed',
  );
  const cancelledAppointments = appointments.filter((a) => a.status === 'cancelled');

  const confirmedCount = confirmedAppointments.length;
  const cancelledCount = cancelledAppointments.length;

  const getStatusChip = (status: string) => {
    const configs: Record<
      string,
      { label: string; color: 'success' | 'error' | 'info' | 'default' }
    > = {
      confirmed: { label: 'Confirmed', color: 'success' },
      cancelled: { label: 'Cancelled', color: 'error' },
      completed: { label: 'Completed', color: 'info' },
    };
    const config = configs[status] || { label: status, color: 'default' };
    return (
      <Chip label={config.label} color={config.color} size="small" sx={{ fontWeight: 'bold' }} />
    );
  };

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
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <LocalHospitalIcon fontSize="large" /> {doctorName} Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          Welcome back! Real-time overview of your practice statistics and schedule.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
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
                  Total Bookings
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 0.5, color: '#1976d2' }}>
                  {totalBookings}
                </Typography>
              </Box>
              <CalendarTodayIcon sx={{ fontSize: 40, color: '#1976d2', opacity: 0.7 }} />
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
                  Confirmed Slots
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 0.5, color: '#2e7d32' }}>
                  {confirmedCount}
                </Typography>
              </Box>
              <CheckCircleIcon sx={{ fontSize: 40, color: '#2e7d32', opacity: 0.7 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card elevation={2} sx={{ borderLeft: '6px solid #d32f2f', borderRadius: 4 }}>
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
                  Cancelled Slots
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 0.5, color: '#d32f2f' }}>
                  {cancelledCount}
                </Typography>
              </Box>
              <CancelIcon sx={{ fontSize: 40, color: '#d32f2f', opacity: 0.7 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
              Active & Confirmed Schedule
            </Typography>
            {confirmedAppointments.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ py: 2, fontStyle: 'italic' }}
              >
                No active or confirmed appointments found for your profile.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Patient Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Time Slot</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Patient Message</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {confirmedAppointments.map((app) => (
                      <TableRow key={app.id} hover>
                        <TableCell sx={{ fontWeight: 500, py: 1.5 }}>
                          {app.patient_name || `Patient #${app.patient}`}
                        </TableCell>
                        <TableCell>{app.date}</TableCell>
                        <TableCell>{app.time || `Slot ${app.time_slot}`}</TableCell>
                        <TableCell
                          sx={{
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {app.notes || '—'}
                        </TableCell>
                        <TableCell>{getStatusChip(app.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'text.secondary' }}>
              Past & Cancelled History
            </Typography>
            {cancelledAppointments.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ py: 2, fontStyle: 'italic' }}
              >
                No cancelled or past appointment logs.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Patient Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Time Slot</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Doctor Logs / Diagnosis</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cancelledAppointments.map((app) => (
                      <TableRow key={app.id} hover>
                        <TableCell sx={{ py: 1.5 }}>
                          {app.patient_name || `Patient #${app.patient}`}
                        </TableCell>
                        <TableCell>{app.date}</TableCell>
                        <TableCell>{app.time || `Slot ${app.time_slot}`}</TableCell>
                        <TableCell>{getStatusChip(app.status)}</TableCell>
                        <TableCell
                          sx={{
                            maxWidth: 250,
                            fontStyle: app.doctor_notes ? 'normal' : 'italic',
                            color: 'text.secondary',
                          }}
                        >
                          {app.doctor_notes ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <DescriptionIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                              {app.doctor_notes}
                            </Box>
                          ) : (
                            'No notes attached.'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
