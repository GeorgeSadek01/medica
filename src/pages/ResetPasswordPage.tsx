import { useState } from 'react';
import { useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, InputAdornment, IconButton, Link } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { ValidationError } from 'yup';
import { resetPasswordSchema } from '../validations';
import type { ResetPasswordFormData } from '../validations';
import { authService } from '../services';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uidb64 = searchParams.get('uidb64') || '';
  const token = searchParams.get('token') || '';

  const [form, setForm] = useState<ResetPasswordFormData>({ password: '', confirm_password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ResetPasswordFormData, string>>>({});

  if (!uidb64 || !token) {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>Invalid or missing reset link.</Alert>
        <Button variant="contained" onClick={() => navigate('/forgot-password')}>
          Request New Reset Link
        </Button>
      </Box>
    );
  }

  const validateField = (name: keyof ResetPasswordFormData, value: string) => {
    try {
      resetPasswordSchema.validateSyncAt(name, { ...form, [name]: value });
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    } catch (err) {
      if (err instanceof ValidationError) {
        setFieldErrors((prev) => ({ ...prev, [name]: err.message }));
      }
    }
  };

  const handleChange = (field: keyof ResetPasswordFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) validateField(field, value);
  };

  const handleBlur = (field: keyof ResetPasswordFormData) => () => {
    validateField(field, form[field]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      resetPasswordSchema.validateSync(form, { abortEarly: false });
    } catch (err) {
      if (!(err instanceof ValidationError)) return;
      const errors: Partial<Record<keyof ResetPasswordFormData, string>> = {};
      for (const inner of err.inner) {
        errors[inner.path as keyof ResetPasswordFormData] = inner.message;
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await authService.confirmPasswordReset(uidb64, token, form.password);
      navigate('/login?message=Password reset successfully. Please sign in.');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || 'Reset failed');
      } else {
        setError('Reset failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h5" sx={{ fontWeight: 600, textAlign: 'center' }} gutterBottom>
        Reset Password
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
        Enter your new password.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        fullWidth
        label="New Password"
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
        label="Confirm New Password"
        type={showPassword ? 'text' : 'password'}
        value={form.confirm_password}
        onChange={handleChange('confirm_password')}
        onBlur={handleBlur('confirm_password')}
        error={!!fieldErrors.confirm_password}
        helperText={fieldErrors.confirm_password}
        margin="normal"
        autoComplete="new-password"
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
        sx={{ mt: 2, mb: 2, py: 1.3 }}
      >
        {loading ? 'Resetting...' : 'Reset Password'}
      </Button>

      <Typography variant="body2" align="center">
        <Link component={RouterLink} to="/login" underline="hover">
          Back to sign in
        </Link>
      </Typography>
    </Box>
  );
}

export default ResetPasswordPage;
