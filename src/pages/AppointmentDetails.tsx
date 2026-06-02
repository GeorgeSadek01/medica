import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  Snackbar,
  Chip,
  Grid,
  Divider,
  CircularProgress,
  Container,
} from '@mui/material';
import {
  CalendarMonth,
  AccessTime,
  Person,
  LocalHospital,
  Payment,
  ArrowBack,
} from '@mui/icons-material';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import appointmentService from '../services/appointment.service';
import { useAppSelector } from '../store';
import { selectUser } from '../store/authSlice';

interface AppointmentData {
  id: number;
  doctor: number;
  doctor_name: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
  paid?: boolean;
  notes?: string;
  doctor_notes?: string;
  patient_name?: string;
}

const STATUS_COLORS: Record<string, 'warning' | 'info' | 'success' | 'error' | 'default'> = {
  pending: 'warning',
  confirmed: 'info',
  completed: 'success',
  cancelled: 'error',
};

function AppointmentDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const [appt, setAppt] = useState<AppointmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [paymentMsg, setPaymentMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);

      const sessionId = searchParams.get('session_id');
      if (sessionId) {
        try {
          await appointmentService.confirmPayment(Number(id), sessionId);
          setPaymentMsg({ type: 'success', text: 'Payment confirmed! Your appointment is booked.' });
        } catch (err: unknown) {
          const msg =
            err && typeof err === 'object' && 'response' in err
              ? ((err as { response?: { data?: { error?: string } } }).response?.data?.error ??
                'Payment confirmation failed')
              : 'Payment confirmation failed';
          if (msg !== 'Already paid') {
            setPaymentMsg({ type: 'error', text: msg });
          } else {
            setPaymentMsg({ type: 'success', text: 'Payment already confirmed.' });
          }
        }
      }

      const a = await appointmentService.getById(Number(id)) as AppointmentData | null;
      setAppt(a);
      setLoading(false);
    })();
  }, [id, searchParams]);

  const handleCancel = async () => {
    if (!appt) return;
    setCancelling(true);
    try {
      await appointmentService.cancel(appt.id);
      setAppt({ ...appt, status: 'cancelled' });
    } catch {
      // ignore
    }
    setCancelling(false);
  };

  const handlePay = () => {
    navigate(`/payment/${id}`);
  };

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );

  if (!appt)
    return (
      <Container maxWidth="sm" sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Appointment not found.
        </Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );

  const isPatient = user?.role === 'patient';
  const isDoctor = user?.role === 'doctor';
  const isAdmin = user?.role === 'admin';
  const showPayButton = appt.status === 'pending' && !appt.paid && isPatient;
  const canCancel = isPatient && appt.status === 'pending';

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {paymentMsg && (
        <Snackbar
          open
          autoHideDuration={6000}
          onClose={() => setPaymentMsg(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity={paymentMsg.type} onClose={() => setPaymentMsg(null)} variant="filled">
            {paymentMsg.text}
          </Alert>
        </Snackbar>
      )}

      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(isPatient ? '/dashboard/patient' : -1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            px: 3,
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {appt.doctor_name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              {appt.specialty}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
              color={STATUS_COLORS[appt.status] ?? 'default'}
              size="small"
              sx={{ fontWeight: 600, color: '#fff' }}
            />
            {appt.paid !== undefined && (
              <Chip
                icon={<Payment sx={{ fontSize: 16 }} />}
                label={appt.paid ? 'Paid' : 'Unpaid'}
                color={appt.paid ? 'success' : 'default'}
                size="small"
                variant={appt.paid ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: 600,
                  ...(appt.paid ? { color: '#fff' } : { borderColor: 'rgba(255,255,255,0.5)', color: 'rgba(255,255,255,0.9)' }),
                }}
              />
            )}
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Appointment Info
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <CalendarMonth fontSize="small" color="action" />
                  <Typography>{appt.date}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <AccessTime fontSize="small" color="action" />
                  <Typography>{appt.time}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person fontSize="small" color="action" />
                  <Typography>{appt.patient_name ?? 'You'}</Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Doctor Details
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <LocalHospital fontSize="small" color="action" />
                  <Typography fontWeight={600}>{appt.doctor_name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {appt.specialty}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {appt.notes && (
              <Grid size={{ xs: 12 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Your Notes
                  </Typography>
                  <Typography>{appt.notes}</Typography>
                </Paper>
              </Grid>
            )}

            {appt.doctor_notes && (
              <Grid size={{ xs: 12 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Doctor&apos;s Notes
                  </Typography>
                  <Typography>{appt.doctor_notes}</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>

          {showPayButton || canCancel ? (
            <>
              <Divider sx={{ my: 3 }} />
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {showPayButton && (
                  <Button variant="contained" size="large" onClick={handlePay} sx={{ px: 4 }}>
                    Pay Now
                  </Button>
                )}
                {canCancel && (
                  <Button
                    variant={showPayButton ? 'outlined' : 'contained'}
                    color="error"
                    onClick={handleCancel}
                    disabled={cancelling}
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Appointment'}
                  </Button>
                )}
              </Box>
              {(isDoctor || isAdmin) && appt.status !== 'cancelled' && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {isDoctor
                      ? 'Manage this appointment from the Appointments Management page.'
                      : 'Manage appointment status from the Admin panel.'}
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            isPatient && appt.status === 'confirmed' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Your appointment is confirmed. If you need to reschedule, please contact the clinic.
                </Typography>
              </Box>
            )
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default AppointmentDetails;
