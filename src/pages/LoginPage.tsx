import { useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Link,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { ValidationError } from 'yup';
import { loginSchema } from '../validations';
import { useAppDispatch, useAppSelector } from '../store';
import { loginUser, clearError, selectAuth } from '../store/authSlice';
import type { LoginFormData } from '../validations';

function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error } = useAppSelector(selectAuth);
  const redirectMessage = searchParams.get('message');

  const [form, setForm] = useState<LoginFormData>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});

  const validateField = (name: keyof LoginFormData, value: string) => {
    try {
      loginSchema.validateSyncAt(name, { ...form, [name]: value });
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    } catch (err) {
      if (err instanceof ValidationError) {
        setFieldErrors((prev) => ({ ...prev, [name]: err.message }));
      }
    }
  };

  const handleChange = (field: keyof LoginFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) validateField(field, value);
  };

  const handleBlur = (field: keyof LoginFormData) => () => {
    validateField(field, form[field]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    try {
      loginSchema.validateSync(form, { abortEarly: false });
    } catch (err) {
      if (!(err instanceof ValidationError)) return;
      const errors: Partial<Record<keyof LoginFormData, string>> = {};
      for (const inner of err.inner) {
        errors[inner.path as keyof LoginFormData] = inner.message;
      }
      setFieldErrors(errors);
      return;
    }

    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      const role = result.payload?.role;
      if (role === 'doctor') {
        navigate('/doctor/dashboard', { replace: true });
      } else if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard/patient', { replace: true });
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {redirectMessage && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => navigate('/login', { replace: true })}>
          {redirectMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

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
        autoFocus
      />

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
        autoComplete="current-password"
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
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>

      <Typography variant="body2" align="center">
        Don&apos;t have an account?{' '}
        <Link component={RouterLink} to="/register" underline="hover">
          Sign up
        </Link>
      </Typography>
    </Box>
  );
}

export default LoginPage;
