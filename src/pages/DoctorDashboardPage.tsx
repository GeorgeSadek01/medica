import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
} from '@mui/material';

import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import DescriptionIcon from '@mui/icons-material/Description';

import appointmentService from '../services/appointment.service';
import doctorService from '../services/doctor.service';
import { useAppSelector } from '../store';
import { selectAuth } from '../store/authSlice';

interface Appointment {
  id: number;
  doctor: number;
  doctor_name: string;
  specialty: string;
  patient: number;
  patient_name: string;
  date: string;
  time_slot: number;
  time: string;
  status: string;
  notes: string;
  doctor_notes: string;
}

export default function DoctorDashboardPage() {
  const { user } = useAppSelector(selectAuth);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const allAppointments = await appointmentService.getAll().catch(() => []);
      const allDoctors = await doctorService.getAll().catch(() => []);
      
      const currentDoctor = allDoctors.find(
        (d) => d.contact === user?.email || `${d.first_name} ${d.last_name}` === `${user?.first_name} ${user?.last_name}`
      );

      if (currentDoctor) {
        const doctorAppointments = allAppointments.filter((app) => app.doctor === currentDoctor.id);
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
  const pendingCount = appointments.filter((a) => a.status === 'pending').length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;

  const upcomingAppointments = appointments.filter((a) => a.status === 'pending' || a.status === 'confirmed');
  const pastAppointments = appointments.filter((a) => a.status === 'completed' || a.status === 'cancelled');

  const handleApprove = async (id: number) => {
    try {
      await appointmentService.confirm(id);
      setAlertMessage({ type: 'success', text: 'Appointment status marked as confirmed! 🚀' });
      fetchDashboardData();
    } catch (error) {
      setAlertMessage({ type: 'error', text: 'Action failed.' });
    }
  };

  // Reject (Task 3)
  const handleReject = async (id: number) => {
    try {
      await appointmentService.reject(id, 'Cancelled by doctor');
      setAlertMessage({ type: 'success', text: 'Appointment request has been rejected.' });
      fetchDashboardData();
    } catch (error) {
      setAlertMessage({ type: 'error', text: 'Action failed.' });
    }
  };

  const handleOpenNotesModal = (app: Appointment) => {
    setSelectedApp(app);
    setDoctorNotes(app.doctor_notes || '');
    setIsNotesOpen(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    try {
      await appointmentService.addNotes(selectedApp.id, doctorNotes);
      await appointmentService.db.update('appointments', selectedApp.id, { status: 'completed' });
      
      setAlertMessage({ type: 'success', text: 'Notes updated and appointment closed successfully!' });
      setIsNotesOpen(false);
      setSelectedApp(null);
      fetchDashboardData();
    } catch (error) {
      setAlertMessage({ type: 'error', text: 'Could not append notes.' });
    }
  };

  const getStatusChip = (status: string) => {
    const configs: Record<string, { label: string; color: 'warning' | 'success' | 'error' | 'info' | 'default' }> = {
      pending: { label: 'Pending', color: 'warning' },
      confirmed: { label: 'Confirmed', color: 'success' },
      cancelled: { label: 'Cancelled', color: 'error' },
      completed: { label: 'Completed', color: 'info' },
    };
    const config = configs[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={45} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
        Doctor Dashboard
      </Typography>
      {alertMessage && (
        <Alert severity={alertMessage.type} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setAlertMessage(null)}>
          {alertMessage.text}
        </Alert>
      )}

      {/* 📊 1. Appointment statistics cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card elevation={2} sx={{ borderLeft: '5px solid #1976d2', borderRadius: 3 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 600 }}>Total Bookings</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 0.5 }}>{totalBookings}</Typography>
              </Box>
              <CalendarTodayIcon sx={{ fontSize: 40, color: '#1976d2', opacity: 0.7 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card elevation={2} sx={{ borderLeft: '5px solid #ed6c02', borderRadius: 3 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 600 }}>Pending Review</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 0.5 }}>{pendingCount}</Typography>
              </Box>
              <PendingActionsIcon sx={{ fontSize: 40, color: '#ed6c02', opacity: 0.7 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card elevation={2} sx={{ borderLeft: '5px solid #2e7d32', borderRadius: 3 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 600 }}>Confirmed Slots</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 0.5 }}>{confirmedCount}</Typography>
              </Box>
              <CheckCircleIcon sx={{ fontSize: 40, color: '#2e7d32', opacity: 0.7 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
              Upcoming & Active Requests
            </Typography>
            {upcomingAppointments.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No upcoming appointments found.</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Patient Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Time Slot</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Patient Notes</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {upcomingAppointments.map((app) => (
                      <TableRow key={app.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{app.patient_name || `Patient #${app.patient}`}</TableCell>
                        <TableCell>{app.date}</TableCell>
                        <TableCell>{app.time || `Slot ${app.time_slot}`}</TableCell>
                        <TableCell>{app.notes || '—'}</TableCell>
                        <TableCell>{getStatusChip(app.status)}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            {app.status === 'pending' && (
                              <>
                                <Tooltip title="Approve">
                                  <IconButton color="success" onClick={() => handleApprove(app.id)}>
                                    <CheckIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject">
                                  <IconButton color="error" onClick={() => handleReject(app.id)}>
                                    <CloseIcon />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            {app.status === 'confirmed' && (
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<NoteAddIcon />}
                                onClick={() => handleOpenNotesModal(app)}
                                sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: 1.5 }}
                              >
                                Add Notes & Complete
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'text.secondary' }}>
              History & Past Appointments
            </Typography>
            {pastAppointments.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No past appointment history.</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Patient Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Time Slot</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Doctor Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pastAppointments.map((app) => (
                      <TableRow key={app.id} hover>
                        <TableCell>{app.patient_name || `Patient #${app.patient}`}</TableCell>
                        <TableCell>{app.date}</TableCell>
                        <TableCell>{app.time || `Slot ${app.time_slot}`}</TableCell>
                        <TableCell>{getStatusChip(app.status)}</TableCell>
                        <TableCell sx={{ maxWidth: 250, fontStyle: app.doctor_notes ? 'normal' : 'italic', color: 'text.secondary' }}>
                          {app.doctor_notes ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <DescriptionIcon sx={{ fontSize: 16 }} />
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

      <Dialog open={isNotesOpen} onClose={() => setIsNotesOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Add Visit Notes</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Patient: <strong>{selectedApp?.patient_name}</strong>
          </Typography>
          <TextField
            label="Doctor Notes"
            fullWidth
            multiline
            rows={4}
            value={doctorNotes}
            onChange={(e) => setDoctorNotes(e.target.value)}
            placeholder="Write clinical findings or notes..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsNotesOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveNotes} disabled={!doctorNotes.trim()} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
            Save & Complete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}