import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';

import appointmentService from '../services/appointment.service';
import doctorService from '../services/doctor.service';
import { useAppSelector } from '../store';
import { selectUser } from '../store/authSlice';

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

export default function DoctorAppointmentsPage() {
  const user = useAppSelector(selectUser);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeApp, setActiveApp] = useState<Appointment | null>(null);

  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('');

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const allApps = await appointmentService.getAll().catch(() => []);
      const allDoctors = await doctorService.getAll().catch(() => []);
      const currentDoc = allDoctors.find((d) => d.contact === user?.email);

      if (currentDoc) {
        setAppointments(
          allApps.filter(
            (app: Appointment) => Number(app.doctor) === Number(currentDoc.id),
          ) as Appointment[],
        );
      } else {
        setAppointments(allApps as Appointment[]);
      }
    } catch {
      setAlert({ type: 'error', text: 'Failed to load appointments.' });
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (user) loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, app: Appointment) => {
    setAnchorEl(event.currentTarget);
    setActiveApp(app);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveApp(null);
  };

  const handleSelectReject = async () => {
    if (!activeApp) return;
    const appId = activeApp.id;
    handleMenuClose();
    try {
      await appointmentService.reject(appId, 'Cancelled by Doctor');
      setAlert({ type: 'success', text: 'Appointment status updated to Cancelled.' });
      loadAppointments();
    } catch {
      setAlert({ type: 'error', text: 'Failed to reject appointment.' });
    }
  };

  const handleSelectAddNotes = () => {
    if (!activeApp) return;
    setDoctorNotes(activeApp.doctor_notes || '');
    setIsNotesOpen(true);
    setAnchorEl(null);
  };

  const handleSaveNotes = async () => {
    if (!activeApp) return;
    try {
      await appointmentService.addNotes(activeApp.id, doctorNotes);
      setAlert({ type: 'success', text: 'Doctor notes and diagnosis updated successfully! 📑' });
      setIsNotesOpen(false);
      setActiveApp(null);
      loadAppointments();
    } catch {
      setAlert({ type: 'error', text: 'Failed to save doctor notes.' });
    }
  };

  const getStatusChip = (status: string) => {
    const configs: Record<
      string,
      { label: string; color: 'warning' | 'success' | 'error' | 'info' | 'default' }
    > = {
      pending: { label: 'Pending Review', color: 'warning' },
      confirmed: { label: 'Confirmed', color: 'success' },
      cancelled: { label: 'Cancelled', color: 'error' },
      completed: { label: 'Completed', color: 'info' },
    };
    const config = configs[status] || { label: status, color: 'default' };
    return (
      <Chip label={config.label} color={config.color} size="small" sx={{ fontWeight: 'bold' }} />
    );
  };

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
        Appointments Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review patient requests, accept or cancel bookings, and document active clinical visits.
      </Typography>

      {alert && (
        <Alert severity={alert.type} sx={{ mb: 2, borderRadius: 2 }} onClose={() => setAlert(null)}>
          {alert.text}
        </Alert>
      )}

      {user && user.role === 'doctor' && !user.verified ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, maxWidth: 480, mx: 'auto', mt: 4 }}>
          <GppMaybeIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            Account Pending Verification
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your account is awaiting admin approval. You cannot manage appointments until verified.
          </Typography>
        </Paper>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, elevation: 2 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f9fafb' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Patient Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Time / Slot</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Doctor Diagnosis</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No appointments associated with your profile yet.
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((app) => (
                  <TableRow key={app.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {app.patient_name || `Patient #${app.patient}`}
                    </TableCell>
                    <TableCell>{app.date}</TableCell>
                    <TableCell>{app.time || `Slot ${app.time_slot}`}</TableCell>
                    <TableCell>{getStatusChip(app.status)}</TableCell>
                    <TableCell
                      sx={{
                        fontStyle: app.doctor_notes ? 'normal' : 'italic',
                        color: 'text.secondary',
                        maxWidth: 180,
                      }}
                    >
                      {app.doctor_notes ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <DescriptionIcon sx={{ fontSize: 16, color: 'info.main' }} />
                          <Typography variant="body2" noWrap>
                            {app.doctor_notes}
                          </Typography>
                        </Box>
                      ) : (
                        'No diagnosis written.'
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        size="small"
                        endIcon={<ArrowDropDownIcon />}
                        onClick={(e) => handleMenuOpen(e, app)}
                        sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: 2 }}
                      >
                        Change Status
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        elevation={3}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleSelectReject} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <CloseIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Reject & Cancel" primaryTypographyProps={{ fontWeight: '500' }} />
        </MenuItem>

        <MenuItem onClick={handleSelectAddNotes} sx={{ color: 'info.main' }}>
          <ListItemIcon>
            <NoteAddIcon fontSize="small" color="info" />
          </ListItemIcon>
          <ListItemText
            primary="Add Notes / Diagnosis"
            primaryTypographyProps={{ fontWeight: '500' }}
          />
        </MenuItem>
      </Menu>

      <Dialog
        open={isNotesOpen}
        onClose={() => {
          setIsNotesOpen(false);
          setActiveApp(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Document Patient Encounter</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Adding clinical records for:{' '}
            <strong>{activeApp?.patient_name || `Patient #${activeApp?.patient}`}</strong>
          </Typography>
          <TextField
            label="Doctor Clinical Notes & Prescription"
            fullWidth
            multiline
            rows={4}
            value={doctorNotes}
            onChange={(e) => setDoctorNotes(e.target.value)}
            placeholder="Write diagnosis, medical findings, or prescribed medications here..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setIsNotesOpen(false);
              setActiveApp(null);
            }}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveNotes}
            disabled={!doctorNotes.trim()}
            sx={{ textTransform: 'none', fontWeight: 'bold' }}
          >
            Save Diagnosis
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
