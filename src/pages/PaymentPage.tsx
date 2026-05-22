import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Divider,
  InputAdornment,
  Container,
  Alert,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import appointmentService from '../services/appointment.service';
import doctorService from '../services/doctor.service';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LockIcon from '@mui/icons-material/Lock';

const PaymentPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<any | null>(null);
  const [doctorInfo, setDoctorInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      if (!id) return;
      const appt = await appointmentService.getById(Number(id));
      if (appt) {
        setAppointment(appt);
        const doc = await doctorService.getById(appt.doctor);
        setDoctorInfo(doc);
      }
      setLoading(false);
    })();
  }, [id]);

  const handlePay = async () => {
    if (!id) return;
    setError(''); // clear previous errors

    if (!cardName.trim()) {
      setError('Please enter the name on the card');
      return;
    }
    if (cardNumber.replace(/\s/g, '').length !== 16 || cvv.length !== 3 || expiry.length !== 5) {
      setError('Please enter valid card details (16-digit card number, MM/YY expiry, 3-digit CVV)');
      return;
    }

    await appointmentService.confirm(Number(id));
    navigate('/dashboard/patient');
  };

  const handlePayLater = () => {
    navigate('/dashboard/patient');
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (expiry.endsWith('/') && val.length === expiry.length - 1) {
      setExpiry(val.slice(0, -1));
      return;
    }
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      setExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    } else if (digits.length === 2 && val.length > expiry.length) {
      setExpiry(`${digits}/`);
    } else {
      setExpiry(digits);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCvv(val);
  };

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  if (!appointment)
    return <Typography sx={{ p: 3, textAlign: 'center' }}>Appointment not found.</Typography>;

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

        <Divider sx={{ mb: error ? 2 : 4 }}>Payment Details</Divider>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Name on Card"
            variant="outlined"
            fullWidth
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            label="Card Number"
            variant="outlined"
            fullWidth
            value={cardNumber}
            onChange={handleCardNumberChange}
            placeholder="0000 0000 0000 0000"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <CreditCardIcon color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Box sx={{ display: 'flex', gap: 3 }}>
            <TextField
              label="Expiry (MM/YY)"
              variant="outlined"
              fullWidth
              value={expiry}
              onChange={handleExpiryChange}
              placeholder="MM/YY"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonthIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="CVV"
              variant="outlined"
              fullWidth
              value={cvv}
              onChange={handleCvvChange}
              placeholder="123"
              type="password"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              onClick={handlePayLater}
              sx={{ borderRadius: 2, py: 1.5, fontWeight: 'bold' }}
            >
              Pay Later
            </Button>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handlePay}
              sx={{ borderRadius: 2, py: 1.5, fontWeight: 'bold' }}
            >
              Pay Now
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default PaymentPage;
