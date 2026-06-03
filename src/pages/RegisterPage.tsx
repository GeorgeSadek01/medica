import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Paper,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CloudUpload,
  Person,
  LocalHospital,
  CheckCircle,
  Description,
} from '@mui/icons-material';
import { ValidationError } from 'yup';
import { registerSchema } from '../validations';
import { useAppDispatch, useAppSelector } from '../store';
import { registerUser, clearError, selectAuth } from '../store/authSlice';
import api from '../services/api';
import doctorService from '../services/doctor.service';
import type { RegisterFormData } from '../validations';

function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(selectAuth);

  const [form, setForm] = useState<RegisterFormData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'patient',
    specialty: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>(
    {},
  );
  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [documentsUploading, setDocumentsUploading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/specialties/');
        setSpecialties((res.data as { id: number; name: string }[]).map((s) => s.name).sort());
      } catch {
        // fallback if specialties endpoint is unavailable
      }
    })();
  }, []);

  const validateField = (name: keyof RegisterFormData, value: string) => {
    try {
      registerSchema.validateSyncAt(name, { ...form, [name]: value });
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    } catch (err) {
      if (err instanceof ValidationError) {
        setFieldErrors((prev) => ({ ...prev, [name]: err.message }));
      }
    }
  };

  const handleChange =
    (field: keyof RegisterFormData) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } },
    ) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      if (fieldErrors[field]) validateField(field, value);
    };

  const handleBlur = (field: keyof RegisterFormData) => () => {
    validateField(field, form[field] ?? '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    try {
      registerSchema.validateSync(form, { abortEarly: false });
    } catch (err) {
      if (!(err instanceof ValidationError)) return;
      const errors: Partial<Record<keyof RegisterFormData, string>> = {};
      for (const inner of err.inner) {
        errors[inner.path as keyof RegisterFormData] = inner.message;
      }
      setFieldErrors(errors);
      return;
    }

    const payload = form.role === 'patient' ? { ...form, specialty: undefined } : form;
    const result = await dispatch(registerUser(payload as RegisterFormData));
    if (registerUser.fulfilled.match(result)) {
      if (form.role === 'doctor' && (identityFile || certificateFile)) {
        setDocumentsUploading(true);
        try {
          const fd = new FormData();
          if (identityFile) fd.append('identity_document', identityFile);
          if (certificateFile) fd.append('medical_certificate', certificateFile);
          await doctorService.uploadDocuments(fd);
        } catch (e) {
          console.error('Document upload failed:', e);
        }
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('medica_session_userId');
      navigate('/login', {
        state: { verifyEmailToast: 'Account created! Please check your email to verify your account before signing in.' },
        replace: true,
      });
    } else if (registerUser.rejected.match(result)) {
      const payload = result.payload as { field_errors?: Partial<Record<keyof RegisterFormData, string>> };
      if (payload?.field_errors) {
        setFieldErrors(payload.field_errors);
      }
    }
  };

  const isDoctor = form.role === 'doctor';

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          label="First Name"
          value={form.first_name}
          onChange={handleChange('first_name')}
          onBlur={handleBlur('first_name')}
          error={!!fieldErrors.first_name}
          helperText={fieldErrors.first_name}
          margin="normal"
          autoComplete="given-name"
          autoFocus
        />
        <TextField
          fullWidth
          label="Last Name"
          value={form.last_name}
          onChange={handleChange('last_name')}
          onBlur={handleBlur('last_name')}
          error={!!fieldErrors.last_name}
          helperText={fieldErrors.last_name}
          margin="normal"
          autoComplete="family-name"
        />
      </Box>

      <TextField
        fullWidth
        label="Email"
        type="email"
        value={form.email}
        onChange={handleChange('email')}
        onBlur={handleBlur('email')}
        error={!!fieldErrors.email}
        helperText={fieldErrors.email}
        margin="normal"
        autoComplete="email"
      />

      <FormControl fullWidth margin="normal" error={!!fieldErrors.role}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
          I want to register as
        </Typography>
        <ToggleButtonGroup
          value={form.role}
          exclusive
          fullWidth
          onChange={(_, value) => {
            if (value) setForm((prev) => ({ ...prev, role: value, specialty: '' }));
          }}
          sx={{
            '& .MuiToggleButton-root': {
              py: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
              },
            },
          }}
        >
          <ToggleButton value="patient">
            <Person sx={{ mr: 1 }} /> Patient
          </ToggleButton>
          <ToggleButton value="doctor">
            <LocalHospital sx={{ mr: 1 }} /> Doctor
          </ToggleButton>
        </ToggleButtonGroup>
        {fieldErrors.role && <FormHelperText>{fieldErrors.role}</FormHelperText>}
      </FormControl>

      {isDoctor && (
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            mt: 2,
            mb: 1,
            borderRadius: 2,
            borderColor: 'primary.light',
            bgcolor: 'action.hover',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LocalHospital color="primary" fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Doctor Details
            </Typography>
          </Box>

          <FormControl fullWidth margin="dense" error={!!fieldErrors.specialty}>
            <InputLabel id="specialty-label">Specialty</InputLabel>
            <Select
              labelId="specialty-label"
              value={form.specialty ?? ''}
              label="Specialty"
              size="small"
              onChange={(e) => {
                setForm((prev) => ({ ...prev, specialty: e.target.value }));
              }}
              onBlur={handleBlur('specialty')}
            >
              {specialties.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
            {fieldErrors.specialty && <FormHelperText>{fieldErrors.specialty}</FormHelperText>}
          </FormControl>

          <Divider sx={{ my: 2 }} />

          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1.5 }}>
            Verification Documents
          </Typography>

          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{
              textTransform: 'none',
              py: 1.5,
              borderStyle: 'dashed',
              borderWidth: 2,
              borderColor: identityFile ? 'success.main' : 'divider',
              color: identityFile ? 'success.main' : 'text.primary',
              '&:hover': { borderColor: 'primary.main', bgcolor: 'transparent' },
            }}
            startIcon={identityFile ? <CheckCircle /> : <Description />}
          >
            {identityFile ? identityFile.name : 'Upload Identity Document'}
            <input
              type="file"
              hidden
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setIdentityFile(e.target.files?.[0] ?? null)}
            />
          </Button>
          {identityFile && (
            <Chip
              icon={<CheckCircle />}
              label={`Identity: ${identityFile.name}`}
              size="small"
              color="success"
              variant="outlined"
              onDelete={() => setIdentityFile(null)}
              sx={{ mt: 1, maxWidth: '100%' }}
            />
          )}

          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{
              mt: 1.5,
              textTransform: 'none',
              py: 1.5,
              borderStyle: 'dashed',
              borderWidth: 2,
              borderColor: certificateFile ? 'success.main' : 'divider',
              color: certificateFile ? 'success.main' : 'text.primary',
              '&:hover': { borderColor: 'primary.main', bgcolor: 'transparent' },
            }}
            startIcon={certificateFile ? <CheckCircle /> : <CloudUpload />}
          >
            {certificateFile ? certificateFile.name : 'Upload Medical Certificate'}
            <input
              type="file"
              hidden
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setCertificateFile(e.target.files?.[0] ?? null)}
            />
          </Button>
          {certificateFile && (
            <Chip
              icon={<CheckCircle />}
              label={`Certificate: ${certificateFile.name}`}
              size="small"
              color="success"
              variant="outlined"
              onDelete={() => setCertificateFile(null)}
              sx={{ mt: 1, maxWidth: '100%' }}
            />
          )}
        </Paper>
      )}

      <TextField
        fullWidth
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={form.password}
        onChange={handleChange('password')}
        onBlur={handleBlur('password')}
        error={!!fieldErrors.password}
        helperText={fieldErrors.password}
        margin="normal"
        autoComplete="new-password"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" tabIndex={-1}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField
        fullWidth
        label="Confirm Password"
        type={showPassword ? 'text' : 'password'}
        value={form.confirm_password}
        onChange={handleChange('confirm_password')}
        onBlur={handleBlur('confirm_password')}
        error={!!fieldErrors.confirm_password}
        helperText={fieldErrors.confirm_password}
        margin="normal"
        autoComplete="new-password"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" tabIndex={-1}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading || documentsUploading}
        sx={{
          mt: 3,
          mb: 2,
          py: 1.5,
          borderRadius: 2,
          fontWeight: 700,
          textTransform: 'none',
          fontSize: '1rem',
        }}
      >
        {documentsUploading ? 'Uploading documents...' : loading ? 'Creating account...' : 'Create Account'}
      </Button>

      <Typography variant="body2" align="center" color="text.secondary">
        Already have an account?{' '}
        <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 600 }}>
          Sign in
        </Link>
      </Typography>
    </Box>
  );
}

export default RegisterPage;
