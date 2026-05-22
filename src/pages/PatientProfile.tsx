import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  CircularProgress,
  IconButton,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../store';
import { selectUser, updateUser } from '../store/authSlice';
import { patientProfileSchema } from '../validations';
import patientService from '../services/patient.service';

const PatientProfile: React.FC = () => {
  const user = useSelector(selectUser);
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    avatar: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name ?? '',
        last_name: user.last_name ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        avatar: user.avatar ?? '',
      });
    }
  }, [user]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field])
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, avatar: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) return;
    setMessage('');
    try {
      await patientProfileSchema.validate(form, { abortEarly: false });
    } catch (err: any) {
      const fieldErrors: Record<string, string> = {};
      err.inner?.forEach((e: any) => {
        if (e.path) fieldErrors[e.path] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setSaving(true);
    try {
      const updated = await patientService.updateProfile(user.id, form);
      if (updated) {
        dispatch(updateUser(updated as any));
        setEditing(false);
        setMessage('Profile updated successfully.');
      }
    } catch {
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }} elevation={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={form.avatar || undefined}
              sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32 }}
            >
              {!form.avatar && (user.first_name?.[0] || '')}
              {!form.avatar && (user.last_name?.[0] || '')}
            </Avatar>
            {editing && (
              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <PhotoCamera fontSize="small" />
              </IconButton>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageUpload}
            />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {user.first_name} {user.last_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
              {user.role}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {message && (
          <Typography
            color={message.includes('successfully') ? 'success.main' : 'error'}
            sx={{ mb: 2, fontWeight: 'bold' }}
          >
            {message}
          </Typography>
        )}

        {editing ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="First Name"
              value={form.first_name}
              onChange={handleChange('first_name')}
              error={!!errors.first_name}
              helperText={errors.first_name}
              fullWidth
            />
            <TextField
              label="Last Name"
              value={form.last_name}
              onChange={handleChange('last_name')}
              error={!!errors.last_name}
              helperText={errors.last_name}
              fullWidth
            />
            <TextField
              label="Email"
              value={form.email}
              onChange={handleChange('email')}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
            />
            <TextField
              label="Phone"
              value={form.phone}
              onChange={handleChange('phone')}
              error={!!errors.phone}
              helperText={errors.phone}
              placeholder="01234567890"
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button variant="outlined" onClick={() => setEditing(false)} disabled={saving}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography>{user.email}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Phone
                </Typography>
                <Typography>{user.phone || '\u2014'}</Typography>
              </Box>
            </Box>
            <Button
              sx={{ mt: 3 }}
              variant="contained"
              onClick={() => {
                setEditing(true);
                setErrors({});
                setMessage('');
              }}
            >
              Edit Profile
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default PatientProfile;
