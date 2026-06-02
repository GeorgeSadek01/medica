import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Divider,
  Container,
  Alert,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import appointmentService from '../services/appointment.service';
import doctorService from '../services/doctor.service';

interface AppointmentData {
  id: number;
  doctor: number;
  doctor_name: string;
  date: string;
  time: string;
  status: string;
  paid?: boolean;
}

interface DoctorData {
  first_name: string;
  last_name: string;
  session_price?: number;
}

function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [doctorInfo, setDoctorInfo] = useState<DoctorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const appt = await appointmentService.getById(Number(id));
        setAppointment(appt);
        if (appt.doctor) {
          const doc = await doctorService.getById(appt.doctor);
          setDoctorInfo(doc);
        }
      } catch {
        setError('Failed to load appointment details.');
      }
      setLoading(false);
    })();
  }, [id]);

  const handlePay = async () => {
    if (!id) return;
    setError('');
    setRedirecting(true);
    try {
      const session = await appointmentService.createPaymentSession(Number(id));
      window.location.href = session.payment_url;
    } catch (err: unknown) {
      setRedirecting(false);
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { error?: string } } }).response?.data?.error ??
            'Failed to create payment session')
          : err instanceof Error
            ? err.message
            : 'Failed to create payment session';
      setError(msg);
    }
  };

  const handlePayLater = () => {
    navigate('/dashboard/patient');
  };

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );

  if (!appointment)
    return <Typography sx={{ p: 3, textAlign: 'center' }}>Appointment not found.</Typography>;

  if (appointment.paid)
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="success" sx={{ mb: 2 }}>
          This appointment has already been paid.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/dashboard/patient')}>
          Back to Dashboard
        </Button>
      </Container>
    );

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }} color="primary" gutterBottom>
            Secure Checkout
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete your booking with {doctorInfo?.first_name} {doctorInfo?.last_name}
          </Typography>
        </Box>

        <Box
          sx={{
            bgcolor: 'primary.light',
            color: 'primary.contrastText',
            p: 3,
            borderRadius: 2,
            mb: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">Total Amount</Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {doctorInfo?.session_price ? `${doctorInfo.session_price} EGP` : 'Free'}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handlePay}
            disabled={redirecting}
            sx={{ borderRadius: 2, py: 1.5, fontWeight: 'bold' }}
          >
            {redirecting ? 'Redirecting to Stripe...' : `Pay ${doctorInfo?.session_price ?? ''} EGP`}
          </Button>
          <Button
            variant="outlined"
            fullWidth
            size="large"
            onClick={handlePayLater}
            disabled={redirecting}
            sx={{ borderRadius: 2, py: 1.5, fontWeight: 'bold' }}
          >
            Pay Later
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
            You will be redirected to Stripe&apos;s secure checkout page.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default PaymentPage;
