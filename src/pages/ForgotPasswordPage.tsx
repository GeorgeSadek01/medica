import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, Link } from '@mui/material';
import { ValidationError } from 'yup';
import { forgotPasswordSchema } from '../validations';
import type { ForgotPasswordFormData } from '../validations';
import { authService } from '../services';

function ForgotPasswordPage() {
  const [form, setForm] = useState<ForgotPasswordFormData>({ email: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ email: e.target.value });
    if (fieldError) setFieldError('');
    if (error) setError('');
  };

  const handleBlur = () => {
    try {
      forgotPasswordSchema.validateSyncAt('email', form);
      setFieldError('');
    } catch (err) {
      if (err instanceof ValidationError) setFieldError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      forgotPasswordSchema.validateSync(form, { abortEarly: false });
    } catch (err) {
      if (err instanceof ValidationError) {
        setFieldError(err.message);
        return;
      }
    }

    setLoading(true);
    try {
      const res = await authService.requestPasswordReset(form.email);
      setSuccess(res.message);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || 'Something went wrong');
      } else {
        setError('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h5" sx={{ fontWeight: 600, textAlign: 'center' }} gutterBottom>
        Forgot Password
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
        Enter your email and we'll send you a reset link.
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        fullWidth
        label="Email"
        type="email"
        value={form.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={!!fieldError}
        helperText={fieldError}
        margin="normal"
        autoComplete="email"
        autoFocus
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
        sx={{ mt: 2, mb: 2, py: 1.3 }}
      >
        {loading ? 'Sending...' : 'Send Reset Link'}
      </Button>

      <Typography variant="body2" align="center">
        Remember your password?{' '}
        <Link component={RouterLink} to="/login" underline="hover">
          Sign in
        </Link>
      </Typography>
    </Box>
  );
}

export default ForgotPasswordPage;
