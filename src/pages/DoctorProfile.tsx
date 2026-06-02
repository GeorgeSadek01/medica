import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import BookingModal from '../components/BookingModal';
import { useParams, useNavigate } from 'react-router-dom';
import doctorService from '../services/doctor.service';
import { useAppSelector } from '../store';
import { selectUser } from '../store/authSlice';

interface AvailabilityBlock {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
}

interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
  specialty: string;
  bio: string;
  session_price?: number;
  availability?: AvailabilityBlock[];
}

const DAY_ORDER: Record<string, number> = {
  Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7,
};

function DoctorProfile() {
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

  const sortedAvailability = [...(doctor.availability ?? [])].sort(
    (a, b) => (DAY_ORDER[a.day] ?? 99) - (DAY_ORDER[b.day] ?? 99),
  );

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4">
              {doctor.first_name} {doctor.last_name}
            </Typography>
            <Chip label={doctor.specialty} color="primary" size="small" sx={{ mt: 1 }} />
            <Typography sx={{ mt: 2 }}>{doctor.bio}</Typography>
            {doctor.session_price ? (
              <Typography sx={{ mt: 2, fontWeight: 'bold' }} color="primary">
                Session Price: {doctor.session_price} EGP
              </Typography>
            ) : null}
            <Button
              sx={{ mt: 2, display: 'block' }}
              variant="contained"
              size="large"
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
          </Paper>
        </Grid>

        {sortedAvailability.length > 0 && (
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Available Hours
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {sortedAvailability.map((block) => (
                <Box
                  key={block.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 1,
                    '& + &': { borderTop: '1px solid', borderColor: 'divider' },
                  }}
                >
                  <Typography fontWeight={600}>{block.day}</Typography>
                  <Typography color="text.secondary">
                    {block.start_time.slice(0, 5)} &mdash; {block.end_time.slice(0, 5)}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
        )}
      </Grid>

      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        doctorId={Number(id)}
        onBooked={() => {
          setBookingOpen(false);
        }}
      />
    </Box>
  );
}

export default DoctorProfile;
