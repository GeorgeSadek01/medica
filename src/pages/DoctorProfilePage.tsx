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
} from '@mui/material';

import PhoneIcon from '@mui/icons-material/Phone';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

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

interface ProfileFormData {
  first_name: string;
  last_name: string;
  specialty: string;
  bio: string;
  contact: string;
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alertMessage, setAlertMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const initDoctorProfile = async () => {
      try {
        setLoading(true);
        const allDoctors = await doctorService.getAll().catch(() => []);

        const currentDoctor = allDoctors.find(
          (d) =>
            d.contact === user?.email ||
            `${d.first_name} ${d.last_name}` === `${user?.first_name} ${user?.last_name}`,
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

    if (!authLoading && user) {
      initDoctorProfile();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
    } catch {
      setAlertMessage({ type: 'error', text: 'An error occurred while saving configuration.' });
    } finally {
      setSaving(false);
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

  return (
    <Box sx={{ maxWidth: 1100, margin: '0 auto', p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
        Doctor Profile Management
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

      <Paper
        elevation={2}
        component="form"
        onSubmit={handleProfileSubmit}
        noValidate
        sx={{ p: 4, borderRadius: 3, mb: 4 }}
      >
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
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
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
    </Box>
  );
}
