import React, { useState, useEffect } from 'react';
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

import PhoneIcon from '@mui/icons-material/Phone';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import doctorService from '../services/doctor.service';
import { useAppSelector } from '../store';
import { selectAuth } from '../store/authSlice';

const MEDICAL_SPECIALTIES = [
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Orthopedics',
  'Ophthalmology',
  'Neurology',
  'General Medicine',
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface ProfileFormData {
  first_name: string;
  last_name: string;
  specialty: string;
  bio: string;
  contact: string;
}

interface AvailabilitySlot {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
}

export default function DoctorProfilePage() {
  const { user, loading: authLoading } = useAppSelector(selectAuth);

  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    specialty: '',
    bio: '',
    contact: '',
  });
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [newSlot, setNewSlot] = useState({ day: 'Monday', start_time: '09:00', end_time: '17:00' });

  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editDialogError, setEditDialogError] = useState<string | null>(null);

  const [slotToDelete, setSlotToDelete] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  //  Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const initDoctorProfile = async () => {
      try {
        setLoading(true);
        const allDoctors = await doctorService.getAll().catch(() => []);

        const currentDoctor = allDoctors.find(
          (d) => d.contact === user?.email || `${d.first_name} ${d.last_name}` === `${user?.first_name} ${user?.last_name}`
        );

        if (currentDoctor) {
          setDoctorId(currentDoctor.id);
          setFormData({
            first_name: currentDoctor.first_name,
            last_name: currentDoctor.last_name,
            specialty: currentDoctor.specialty || 'General Medicine',
            bio: currentDoctor.bio || '',
            contact: currentDoctor.contact,
          });
          setSlots(currentDoctor.availability || []);
        } else if (user) {
          setFormData({
            first_name: user.first_name || 'Ahmed',
            last_name: user.last_name || 'Hassan',
            specialty: 'General Medicine',
            bio: '',
            contact: user.email || '',
          });
        }
      } catch (error) {
        console.error('Error initializing doctor profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (user) {
        initDoctorProfile();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validateForm = (): boolean => {
    const tempErrors: Record<string, string> = {};
    
    if (!formData.contact.trim()) {
      tempErrors.contact = 'Contact / Phone number cannot be left empty.';
    } else if (formData.contact.length < 5) {
      tempErrors.contact = 'Please enter a valid contact method.';
    }

    if (!formData.bio.trim()) {
      tempErrors.bio = 'Your professional bio is required.';
    } else if (formData.bio.length < 15) {
      tempErrors.bio = 'Bio details are too short. Please write at least 15 characters.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMessage(null);

    if (!validateForm()) {
      setAlertMessage({ type: 'error', text: 'Please review the highlighted errors below.' });
      return;
    }

    try {
      setSaving(true);
      if (doctorId) {
        await doctorService.updateProfile(doctorId, {
          specialty: formData.specialty,
          bio: formData.bio,
          contact: formData.contact,
        });
        setAlertMessage({ type: 'success', text: 'Profile information saved successfully! 🎉' });
      } else {
        setAlertMessage({ type: 'success', text: 'Profile changes applied locally!' });
      }
    } catch (error) {
      setAlertMessage({ type: 'error', text: 'An error occurred while saving configuration.' });
    } finally {
      setSaving(false);
    }
  };

  // add new slot
  const handleAddSlot = async () => {
    if (newSlot.start_time >= newSlot.end_time) {
      setAlertMessage({ type: 'error', text: 'Shift End time must be after the Shift Start time!' });
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
    } catch (error) {
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
    } catch (error) {
      setAlertMessage({ type: 'error', text: 'Failed to clear slot from server.' });
    } finally {
      setIsDeleteOpen(false);
      setSlotToDelete(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={45} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1100, margin: '0 auto', p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
        Doctor Profile & Availability Management
      </Typography>

      {alertMessage && (
        <Alert severity={alertMessage.type} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setAlertMessage(null)}>
          {alertMessage.text}
        </Alert>
      )}

      <Paper elevation={2} component="form" onSubmit={handleProfileSubmit} noValidate sx={{ p: 4, borderRadius: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
          Profile Information
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
            <TextField label="First Name" value={formData.first_name} fullWidth disabled />
            <TextField label="Last Name" value={formData.last_name} fullWidth disabled />
            <TextField
              select
              label="Medical Specialty"
              name="specialty"
              value={formData.specialty}
              onChange={handleInputChange}
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalHospitalIcon color="primary" />
                    </InputAdornment>
                  ),
                },
              }}
            >
              {MEDICAL_SPECIALTIES.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>
          </Box>

          <TextField
            label="Contact / Phone Number"
            name="contact"
            value={formData.contact}
            onChange={handleInputChange}
            fullWidth
            error={!!errors.contact}
            helperText={errors.contact}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="primary" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Professional Bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            fullWidth
            multiline
            rows={4}
            error={!!errors.bio}
            helperText={errors.bio}
            placeholder="Describe your medical expertise..."
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={saving} 
              size="medium"
              sx={{ px: 4, fontWeight: 'bold', textTransform: 'none', borderRadius: 2 }}
            >
              {saving ? <CircularProgress size={24} /> : 'Save Profile'}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
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
                  <MenuItem key={d} value={d}>{d}</MenuItem>
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

        <Grid item xs={12} md={7}>
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
                          <IconButton edge="end" color="primary" onClick={() => handleOpenEdit(slot)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton edge="end" color="error" onClick={() => handleOpenDeleteConfirm(slot.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={slot.day}
                        primaryTypographyProps={{ fontWeight: 'bold', color: 'primary.main' }}
                        secondary={
                          <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
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
                  setEditingSlot(p => p ? { ...p, day: e.target.value } : null);
                }}
                fullWidth
                sx={{ mt: 1 }}
              >
                {DAYS_OF_WEEK.map((d) => (
                  <MenuItem key={d} value={d}>{d}</MenuItem>
                ))}
              </TextField>
              <TextField
                type="time"
                label="Start Time"
                value={editingSlot.start_time}
                onChange={(e) => {
                  setEditDialogError(null);
                  setEditingSlot(p => p ? { ...p, start_time: e.target.value } : null);
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
                  setEditingSlot(p => p ? { ...p, end_time: e.target.value } : null);
                }}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsEditOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEditSlot} sx={{ textTransform: 'none' }}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>Delete Timeslot</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this active working window from your weekly schedule? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setIsDeleteOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleConfirmDeleteSlot} variant="contained" color="error" sx={{ textTransform: 'none', fontWeight: 'bold' }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}