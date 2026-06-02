import { useState, useEffect, useRef } from 'react';
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
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { ValidationError } from 'yup';
import { loginSchema } from '../validations';
import { useAppDispatch, useAppSelector } from '../store';
import { loginUser, clearError, selectAuth } from '../store/authSlice';
import type { LoginFormData } from '../validations';
import { authService } from '../services';

function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error } = useAppSelector(selectAuth);
  const redirectMessage = searchParams.get('message');

  const [form, setForm] = useState<LoginFormData>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [googleError, setGoogleError] = useState('');

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

  const googleButtonRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);
  const initializedRef = useRef(false);
  const loginAttemptedRef = useRef(false);

  const handleGoogleCredential = async (credential: string) => {
    if (loginAttemptedRef.current) return;
    loginAttemptedRef.current = true;

    try {
      const res = await authService.googleLogin(credential);
      const role = res.user?.role;
      if (role === 'doctor') {
        navigate('/doctor/dashboard', { replace: true });
      } else if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard/patient', { replace: true });
      }
    } catch {
      loginAttemptedRef.current = false;
      setGoogleError('Google sign in failed');
    }
  };

  const credentialCallbackRef = useRef(handleGoogleCredential);
  credentialCallbackRef.current = handleGoogleCredential;

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const initGIS = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: { credential: string }) => {
          if (response?.credential) {
            credentialCallbackRef.current(response.credential);
          }
        },
      });
      if (googleButtonRef.current) {
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
        });
      }
    };

    if (window.google?.accounts?.id) {
      initGIS();
      return;
    }

    if (scriptLoadedRef.current) return;
    scriptLoadedRef.current = true;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initGIS;
    document.body.appendChild(script);

    return () => {
      // cleanup not needed - GIS handles its own state
    };
  }, []);

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {redirectMessage && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => navigate('/login', { replace: true })}>
          {redirectMessage}
        </Alert>
      )}

      {(error || googleError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || googleError}
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

      <Typography variant="body2" align="right" sx={{ mt: 0.5 }}>
        <Link component={RouterLink} to="/forgot-password" underline="hover">
          Forgot password?
        </Link>
      </Typography>

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

      <Divider sx={{ my: 2 }}>
        <Typography variant="body2" color="text.secondary">
          OR
        </Typography>
      </Divider>

      <Box ref={googleButtonRef} sx={{ display: 'flex', justifyContent: 'center', mb: 2, minHeight: 40 }} />

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
