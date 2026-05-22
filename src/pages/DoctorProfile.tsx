import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import BookingModal from '../components/BookingModal';
import { useParams, useNavigate } from 'react-router-dom';
import doctorService from '../services/doctor.service';
import { useAppSelector } from '../store';
import { selectUser } from '../store/authSlice';

interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
  specialty: string;
  bio: string;
  session_price?: number;
}

const DoctorProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return setLoading(false);
      setLoading(true);
      const d = await doctorService.getById(Number(id));
      setDoctor(d);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <Typography sx={{ p: 3 }}>Loading...</Typography>;
  if (!doctor) return <Typography sx={{ p: 3 }}>Doctor not found.</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4">
          {doctor.first_name} {doctor.last_name}
        </Typography>
        <Typography color="text.secondary">{doctor.specialty}</Typography>
        <Typography sx={{ mt: 2 }}>{doctor.bio}</Typography>
        {doctor.session_price && (
          <Typography sx={{ mt: 2, fontWeight: 'bold' }}>
            Session Price: {doctor.session_price} EGP
          </Typography>
        )}
        <Button
          sx={{ mt: 2 }}
          variant="contained"
          onClick={() => {
            if (!user) {
              navigate('/login?message=Please sign in to book an appointment.');
              return;
            }
            setBookingOpen(true);
          }}
        >
          Book Appointment
        </Button>
        <BookingModal
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          doctorId={Number(id)}
          onBooked={() => {
            // Optionally refresh or show a message
            setBookingOpen(false);
          }}
        />
      </Paper>
    </Box>
  );
};

export default DoctorProfile;
