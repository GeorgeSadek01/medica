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
} from '@mui/material';

import PhoneIcon from '@mui/icons-material/Phone';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';

import doctorService from '../services/doctor.service';
import adminService from '../services/admin.service';
import { useAppSelector } from '../store';
import { selectAuth } from '../store/authSlice';

interface ProfileFormData {
  first_name: string;
  last_name: string;
  specialty: string;
  bio: string;
  contact: string;
  session_price: number;
  session_duration: number;
}

export default function DoctorProfilePage() {
  const { user, loading: authLoading } = useAppSelector(selectAuth);
  const navigate = useNavigate();

  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    specialty: '',
    bio: '',
    contact: '',
    session_price: 0,
    session_duration: 30,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [specialtiesList, setSpecialtiesList] = useState<string[]>([]);
  const [docStatus, setDocStatus] = useState<'none' | 'pending' | 'rejected' | 'approved'>('none');
  const [rejectionReason, setRejectionReason] = useState('');

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

        const specs = await adminService.getSpecialties().catch(() => []);
        const specNames = (specs as { name: string }[]).map((s) => s.name).sort();
        setSpecialtiesList(specNames);

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
          const docSpecialty = profileData.specialty || 'General Medicine';
          setFormData({
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            specialty: docSpecialty,
            bio: profileData.bio || '',
            contact: profileData.contact,
            session_price: profileData.session_price ?? 0,
            session_duration: profileData.session_duration ?? 30,
          });
          if (docSpecialty && !specNames.includes(docSpecialty)) {
            setSpecialtiesList((prev) => [...prev, docSpecialty].sort());
          }
        } else if (user) {
          setFormData({
            first_name: user.first_name || 'Ahmed',
            last_name: user.last_name || 'Hassan',
            specialty: 'General Medicine',
            bio: '',
            contact: user.email || '',
            session_price: 0,
            session_duration: 30,
          });
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
      const payload = {
        specialty: formData.specialty,
        bio: formData.bio,
        contact: formData.contact,
        session_price: formData.session_price,
        session_duration: formData.session_duration,
      };

      if (doctorId) {
        await doctorService.updateProfile(doctorId, payload);
      } else {
        const saved = await doctorService.updateMyProfile(payload);
        if (saved?.id) {
          setDoctorId(saved.id);
        }
      }

      if (formData.specialty && !specialtiesList.includes(formData.specialty)) {
        await adminService.createSpecialty(formData.specialty).catch(() => {});
        setSpecialtiesList((prev) => [...prev, formData.specialty].sort());
      }

      setAlertMessage({ type: 'success', text: 'Profile information saved successfully! 🎉' });
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

  if (user && user.role === 'doctor' && !user.verified) {
    const isRejected = docStatus === 'rejected';
    return (
      <Box sx={{ position: 'fixed', top: '64px', left: 0, right: 0, bottom: 0, zIndex: 1250, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'background.default' }}>
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
            <>
              <Typography variant="body1" color="text.secondary">
                Your account is awaiting admin approval. Profile editing is unavailable until you are verified.
              </Typography>
            </>
          )}
        </Paper>
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
              {specialtiesList.map((option) => (
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
            label="Session Price (EGP)"
            name="session_price"
            type="number"
            value={formData.session_price}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, session_price: Math.max(0, Number(e.target.value)) }))
            }
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">EGP</InputAdornment>
                ),
              },
              htmlInput: { min: 0 },
            }}
            helperText="Set your consultation fee per session"
          />

          <TextField
            label="Session Duration (minutes)"
            name="session_duration"
            type="number"
            value={formData.session_duration}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, session_duration: Math.max(15, Number(e.target.value)) }))
            }
            fullWidth
            slotProps={{
              htmlInput: { min: 15, step: 5 },
            }}
            helperText="Duration per appointment session (min 15 min, step 5 min)"
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
