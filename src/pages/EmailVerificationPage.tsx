import { useEffect, useState } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Alert, CircularProgress, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { authService } from '../services';

function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const uidb64 = searchParams.get('uidb64') || '';
  const token = searchParams.get('token') || '';

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!uidb64 || !token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    authService
      .verifyEmail(uidb64, token)
      .then((res) => {
        setStatus('success');
        setMessage(res.message || 'Email verified successfully!');
      })
      .catch((err: unknown) => {
        setStatus('error');
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosErr = err as { response?: { data?: { error?: string } } };
          setMessage(axiosErr.response?.data?.error || 'Verification failed');
        } else {
          setMessage('Verification failed');
        }
      });
  }, [uidb64, token]);

  if (status === 'loading') {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Verifying your email...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ textAlign: 'center', py: 2 }}>
      {status === 'success' ? (
        <>
          <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
          <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>
          <Button
            variant="contained"
            component={RouterLink}
            to="/login"
            sx={{ mt: 1 }}
          >
            Go to Sign In
          </Button>
        </>
      ) : (
        <>
          <Alert severity="error" sx={{ mb: 2 }}>{message}</Alert>
          <Button
            variant="contained"
            component={RouterLink}
            to="/login"
            sx={{ mt: 1 }}
          >
            Back to Sign In
          </Button>
        </>
      )}
    </Box>
  );
}

export default EmailVerificationPage;
