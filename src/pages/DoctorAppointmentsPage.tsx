import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Divider,
} from '@mui/material';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';
import PaymentIcon from '@mui/icons-material/Payment';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';

import adminService from '../services/admin.service';
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
  paid: boolean;
  refunded: boolean;
  allowed_next_statuses?: string[];
}

interface MenuAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  handler: () => void;
}

function isTerminal(status: string) {
  return status === 'completed' || status === 'cancelled';
}

export default function DoctorAppointmentsPage() {
  const user = useAppSelector(selectUser);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [docStatus, setDocStatus] = useState<'none' | 'pending' | 'rejected' | 'approved'>('none');
  const [rejectionReason, setRejectionReason] = useState('');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeApp, setActiveApp] = useState<Appointment | null>(null);

  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [refundConfirm, setRefundConfirm] = useState<Appointment | null>(null);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const allApps = await appointmentService.getAll().catch(() => []);
      let currentDocId: number | null = null;

      try {
        const myProfile = await doctorService.getMyProfile();
        currentDocId = myProfile.id;
      } catch {
        const allDoctors = await doctorService.getAll().catch(() => []);
        const currentDoc = allDoctors.find((d: any) => d.contact === user?.email);
        if (currentDoc) currentDocId = currentDoc.id;
      }

      if (currentDocId) {
        setAppointments(
          allApps.filter(
            (app: Appointment) => Number(app.doctor) === Number(currentDocId),
          ) as Appointment[],
        );
      } else {
        setAppointments(allApps as Appointment[]);
      }

      if (user?.role === 'doctor' && !user.verified) {
        try {
          const docs = await adminService.getDocuments();
          const myDoc = (docs as any[]).find((d: any) => d.doctor_id === user.id);
          if (myDoc) {
            setDocStatus(myDoc.status);
            setRejectionReason(myDoc.rejection_reason || '');
          }
        } catch {
          // ignore
        }
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

  const handleConfirm = async () => {
    if (!activeApp) return;
    const appId = activeApp.id;
    handleMenuClose();
    try {
      await appointmentService.confirm(appId);
      setAlert({ type: 'success', text: 'Appointment confirmed successfully.' });
      loadAppointments();
    } catch {
      setAlert({ type: 'error', text: 'Failed to confirm appointment.' });
    }
  };

  const handleComplete = async () => {
    if (!activeApp) return;
    const appId = activeApp.id;
    const notes = activeApp.doctor_notes;
    handleMenuClose();
    try {
      await appointmentService.complete(appId, notes || undefined);
      setAlert({ type: 'success', text: 'Appointment marked as completed.' });
      loadAppointments();
    } catch {
      setAlert({ type: 'error', text: 'Failed to complete appointment.' });
    }
  };

  const handleReject = async () => {
    if (!activeApp) return;
    if (activeApp.paid) {
      setRefundConfirm(activeApp);
      return;
    }
    await doReject(activeApp);
  };

  const doReject = async (app: Appointment) => {
    try {
      await appointmentService.reject(app.id, 'Cancelled by Doctor');
      setAlert({ type: 'success', text: 'Appointment cancelled.' });
      loadAppointments();
    } catch {
      setAlert({ type: 'error', text: 'Failed to cancel appointment.' });
    }
  };

  const handleRefundConfirm = async () => {
    if (!refundConfirm) return;
    setRefundConfirm(null);
    setAnchorEl(null);
    try {
      await appointmentService.reject(refundConfirm.id, 'Cancelled by Doctor - refunded');
      setAlert({ type: 'success', text: 'Appointment cancelled and full refund issued to patient.' });
      loadAppointments();
    } catch {
      setAlert({ type: 'error', text: 'Failed to cancel appointment or process refund.' });
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
      setAlert({ type: 'success', text: 'Doctor notes saved successfully.' });
      setIsNotesOpen(false);
      setActiveApp(null);
      loadAppointments();
    } catch {
      setAlert({ type: 'error', text: 'Failed to save doctor notes.' });
    }
  };

  const menuActions = useMemo((): MenuAction[] => {
    if (!activeApp) return [];
    const status = activeApp.status;
    const next = activeApp.allowed_next_statuses ?? [];
    const actions: MenuAction[] = [];

    if (next.includes('confirmed')) {
      actions.push({
        key: 'confirm',
        label: 'Confirm Appointment',
        icon: <CheckCircleIcon fontSize="small" />,
        color: 'success.main',
        handler: handleConfirm,
      });
    }

    if (next.includes('completed')) {
      actions.push({
        key: 'complete',
        label: 'Mark as Completed',
        icon: <CheckCircleIcon fontSize="small" />,
        color: 'info.main',
        handler: handleComplete,
      });
    }

    if (next.includes('cancelled')) {
      const isPending = status === 'pending';
      actions.push({
        key: 'cancel',
        label: isPending ? 'Reject & Cancel' : 'Cancel Appointment',
        icon: <CancelIcon fontSize="small" />,
        color: 'error.main',
        handler: handleReject,
      });
    }

    if (!isTerminal(status)) {
      if (actions.length > 0) {
        actions.push({
          key: 'divider',
          label: '',
          icon: null,
          color: '',
          handler: () => {},
        } as unknown as MenuAction);
      }
      actions.push({
        key: 'notes',
        label: 'Add / Edit Notes',
        icon: <NoteAddIcon fontSize="small" />,
        color: 'info.main',
        handler: handleSelectAddNotes,
      });
    }

    return actions;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeApp]);

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
          <GppMaybeIcon sx={{ fontSize: 64, color: docStatus === 'rejected' ? 'error.main' : 'warning.main', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            {docStatus === 'rejected' ? 'Account Verification Rejected' : 'Account Pending Verification'}
          </Typography>
          {docStatus === 'rejected' ? (
            <>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Your submitted documents did not meet the verification requirements.
              </Typography>
              {rejectionReason && (
                <Typography variant="body2" color="error" sx={{ mb: 1, fontWeight: 600 }}>
                  Reason: {rejectionReason}
                </Typography>
              )}
              <Button variant="contained" onClick={() => navigate('/doctor/dashboard')} sx={{ mt: 1 }}>
                Go to Dashboard to Re-upload
              </Button>
            </>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Your account is awaiting admin approval. You cannot manage appointments until verified.
            </Typography>
          )}
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
                <TableCell sx={{ fontWeight: 'bold' }}>Payment</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Doctor Diagnosis</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
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
                    <TableCell>
                      {app.refunded ? (
                        <Chip
                          icon={<MoneyOffIcon sx={{ fontSize: 14 }} />}
                          label="Refunded"
                          color="warning"
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      ) : app.paid ? (
                        <Chip
                          icon={<PaymentIcon sx={{ fontSize: 14 }} />}
                          label="Paid"
                          color="success"
                          size="small"
                          variant="filled"
                          sx={{ fontWeight: 600, color: '#fff' }}
                        />
                      ) : (
                        <Chip label="Unpaid" size="small" variant="outlined" sx={{ fontWeight: 500 }} />
                      )}
                    </TableCell>
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
                        disabled={isTerminal(app.status)}
                      >
                        {isTerminal(app.status) ? 'No Actions' : 'Change Status'}
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
        {menuActions.map((action) =>
          action.key === 'divider' ? (
            <Divider key="menu-divider" />
          ) : (
            <MenuItem
              key={action.key}
              onClick={action.handler}
              sx={{ color: action.color }}
            >
              {action.icon && (
                <ListItemIcon sx={{ color: action.color, minWidth: 36 }}>
                  {action.icon}
                </ListItemIcon>
              )}
              <ListItemText
                primary={action.label}
                slotProps={{ primary: { sx: { fontWeight: 500 } } }}
              />
            </MenuItem>
          ),
        )}
      </Menu>

      <Dialog
        open={Boolean(refundConfirm)}
        onClose={() => setRefundConfirm(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
          Confirm Cancellation & Refund
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            This appointment has already been <strong>paid</strong>. Cancelling will issue a{' '}
            <strong>full refund</strong> to the patient.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Patient: <strong>{refundConfirm?.patient_name || `Patient #${refundConfirm?.patient}`}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Date: <strong>{refundConfirm?.date}</strong> at <strong>{refundConfirm?.time}</strong>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setRefundConfirm(null)} sx={{ textTransform: 'none' }}>
            Keep Appointment
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRefundConfirm}
            sx={{ textTransform: 'none', fontWeight: 'bold' }}
          >
            Cancel & Refund
          </Button>
        </DialogActions>
      </Dialog>

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
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
            Current status: <Chip label={activeApp?.status} size="small" sx={{ ml: 0.5 }} />
            {activeApp?.status === 'confirmed' && (
              <span> &mdash; Use &quot;Mark as Completed&quot; from the status menu to complete the appointment.</span>
            )}
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
