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
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { ValidationError } from 'yup';
import { registerSchema } from '../validations';
import { useAppDispatch, useAppSelector } from '../store';
import { registerUser, clearError, selectAuth } from '../store/authSlice';
import api from '../services/api';
import type { RegisterFormData } from '../validations';

function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
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

    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      navigate('/', { replace: true });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
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
        <InputLabel id="role-label">Role</InputLabel>
        <Select
          labelId="role-label"
          value={form.role}
          label="Role"
          onChange={(e) => {
            const value = e.target.value as 'patient' | 'doctor';
            setForm((prev) => ({ ...prev, role: value }));
          }}
          onBlur={handleBlur('role')}
        >
          <MenuItem value="patient">Patient</MenuItem>
          <MenuItem value="doctor">Doctor</MenuItem>
        </Select>
        {fieldErrors.role && <FormHelperText>{fieldErrors.role}</FormHelperText>}
      </FormControl>

      {form.role === 'doctor' && (
        <FormControl fullWidth margin="normal" error={!!fieldErrors.specialty}>
          <InputLabel id="specialty-label">Specialty</InputLabel>
          <Select
            labelId="specialty-label"
            value={form.specialty ?? ''}
            label="Specialty"
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
        disabled={loading}
        sx={{ mt: 2, mb: 2, py: 1.3 }}
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>

      <Typography variant="body2" align="center">
        Already have an account?{' '}
        <Link component={RouterLink} to="/login" underline="hover">
          Sign in
        </Link>
      </Typography>
    </Box>
  );
}

export default RegisterPage;
