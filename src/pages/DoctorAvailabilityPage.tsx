import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  MenuItem,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import Grid from '@mui/material/Grid';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';

import adminService from '../services/admin.service';
import doctorService from '../services/doctor.service';
import { useAppSelector } from '../store';
import { selectAuth } from '../store/authSlice';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface AvailabilitySlot {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
}

export default function DoctorAvailabilityPage() {
  const { user, loading: authLoading } = useAppSelector(selectAuth);
  const navigate = useNavigate();

  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [sessionPrice, setSessionPrice] = useState(0);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [newSlot, setNewSlot] = useState({ day: 'Monday', start_time: '09:00', end_time: '17:00' });
  const [docStatus, setDocStatus] = useState<'none' | 'pending' | 'rejected' | 'approved'>('none');
  const [rejectionReason, setRejectionReason] = useState('');

  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editDialogError, setEditDialogError] = useState<string | null>(null);

  const [slotToDelete, setSlotToDelete] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const initAvailability = async () => {
      try {
        setLoading(true);

        let profileData = null;

        try {
          profileData = await doctorService.getMyProfile();
        } catch {
          const allDoctors = await doctorService.getAll().catch(() => []);
          profileData = allDoctors.find(
            (d: any) =>
              d.contact === user?.email ||
              `${d.first_name} ${d.last_name}` === `${user?.first_name} ${user?.last_name}`,
          ) || null;
        }

        if (profileData) {
          setDoctorId(profileData.id);
          setSessionPrice(profileData.session_price ?? 0);
          setSlots(profileData.availability || []);
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
      } catch (error) {
        console.error('Error initializing doctor availability:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      initAvailability();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // add new slot
  const handleAddSlot = async () => {
    if (sessionPrice <= 0) {
      setAlertMessage({
        type: 'error',
        text: 'Please set your session price in your profile before adding availability schedules.',
      });
      return;
    }

    if (newSlot.start_time >= newSlot.end_time) {
      setAlertMessage({
        type: 'error',
        text: 'Shift End time must be after the Shift Start time!',
      });
      return;
    }

    if (!doctorId) {
      const mockId = Math.floor(Math.random() * 1000);
      setSlots((prev) => [...prev, { id: mockId, ...newSlot }]);
      return;
    }
    try {
      const addedSlot = await doctorService.createAvailability(doctorId, newSlot);
      setSlots((prev) => [...prev, addedSlot as AvailabilitySlot]);
      setAlertMessage({ type: 'success', text: 'New availability window appended!' });
    } catch {
      setAlertMessage({ type: 'error', text: 'Failed to synchronize slot.' });
    }
  };

  // modal
  const handleOpenEdit = (slot: AvailabilitySlot) => {
    setEditingSlot(slot);
    setEditDialogError(null);
    setIsEditOpen(true);
  };

  // edit slot
  const handleSaveEditSlot = () => {
    if (!editingSlot) return;

    if (editingSlot.start_time >= editingSlot.end_time) {
      setEditDialogError('End time cannot precede or equal start time.');
      return;
    }

    setSlots((prev) => prev.map((s) => (s.id === editingSlot.id ? editingSlot : s)));
    setIsEditOpen(false);
    setEditDialogError(null);
    setAlertMessage({ type: 'success', text: 'Schedule item successfully adjusted.' });
  };

  const handleOpenDeleteConfirm = (id: number) => {
    setSlotToDelete(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDeleteSlot = async () => {
    if (slotToDelete === null) return;

    if (!doctorId) {
      setSlots((prev) => prev.filter((s) => s.id !== slotToDelete));
      setIsDeleteOpen(false);
      return;
    }
    try {
      await doctorService.deleteAvailability(doctorId, slotToDelete);
      setSlots((prev) => prev.filter((s) => s.id !== slotToDelete));
      setAlertMessage({ type: 'success', text: 'Timeslot discarded successfully.' });
    } catch {
      setAlertMessage({ type: 'error', text: 'Failed to clear slot from server.' });
    } finally {
      setIsDeleteOpen(false);
      setSlotToDelete(null);
    }
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

  if (user && user.role === 'doctor' && !user.verified) {
    const isRejected = docStatus === 'rejected';
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, maxWidth: 480 }}>
          <GppMaybeIcon sx={{ fontSize: 64, color: isRejected ? 'error.main' : 'warning.main', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            {isRejected ? 'Account Verification Rejected' : 'Account Pending Verification'}
          </Typography>
          {isRejected ? (
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
              Your account is awaiting admin approval. You cannot manage availability until verified.
            </Typography>
          )}
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1100, margin: '0 auto', p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
        Availability Management
      </Typography>

      {alertMessage && (
        <Alert
          severity={alertMessage.type}
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setAlertMessage(null)}
        >
          {alertMessage.text}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Add New Working Window
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                select
                label="Select Day"
                value={newSlot.day}
                onChange={(e) => setNewSlot((p) => ({ ...p, day: e.target.value }))}
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon color="primary" />
                      </InputAdornment>
                    ),
                  },
                }}
              >
                {DAYS_OF_WEEK.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                type="time"
                label="Shift Start"
                value={newSlot.start_time}
                onChange={(e) => setNewSlot((p) => ({ ...p, start_time: e.target.value }))}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <TextField
                type="time"
                label="Shift End"
                value={newSlot.end_time}
                onChange={(e) => setNewSlot((p) => ({ ...p, end_time: e.target.value }))}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddSlot}
                fullWidth
                sx={{ py: 1.2, fontWeight: 'bold', borderRadius: 2, textTransform: 'none' }}
              >
                Add To Schedule
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Weekly Active Schedule ({slots.length})
            </Typography>
            {slots.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No active timeslots or shifts created for this week.
              </Typography>
            ) : (
              <List disablePadding>
                {slots.map((slot, index) => (
                  <React.Fragment key={slot.id || index}>
                    <ListItem
                      secondaryAction={
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            edge="end"
                            color="primary"
                            onClick={() => handleOpenEdit(slot)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => handleOpenDeleteConfirm(slot.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={slot.day}
                        slotProps={{ primary: { sx: { fontWeight: 'bold', color: 'primary.main' } } }}
                        secondary={
                          <Box
                            component="span"
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}
                          >
                            <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            {slot.start_time} - {slot.end_time}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < slots.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Edit Shift Window</DialogTitle>
        <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {editDialogError && (
            <Alert severity="error" sx={{ mt: 1, borderRadius: 2 }}>
              {editDialogError}
            </Alert>
          )}

          {editingSlot && (
            <>
              <TextField
                select
                label="Day"
                value={editingSlot.day}
                onChange={(e) => {
                  setEditDialogError(null);
                  setEditingSlot((p) => (p ? { ...p, day: e.target.value } : null));
                }}
                fullWidth
                sx={{ mt: 1 }}
              >
                {DAYS_OF_WEEK.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                type="time"
                label="Start Time"
                value={editingSlot.start_time}
                onChange={(e) => {
                  setEditDialogError(null);
                  setEditingSlot((p) => (p ? { ...p, start_time: e.target.value } : null));
                }}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                type="time"
                label="End Time"
                value={editingSlot.end_time}
                onChange={(e) => {
                  setEditDialogError(null);
                  setEditingSlot((p) => (p ? { ...p, end_time: e.target.value } : null));
                }}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsEditOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveEditSlot} sx={{ textTransform: 'none' }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>Delete Timeslot</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this active working window from your weekly schedule?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setIsDeleteOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDeleteSlot}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none', fontWeight: 'bold' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
