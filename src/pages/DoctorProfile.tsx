import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Chip,
  Divider,
  Rating,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import BookingModal from '../components/BookingModal';
import { useParams, useNavigate } from 'react-router-dom';
import doctorService from '../services/doctor.service';
import reviewService from '../services/review.service';
import appointmentService from '../services/appointment.service';
import { useAppSelector } from '../store';
import { selectUser } from '../store/authSlice';

interface AvailabilityBlock {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
}

interface Review {
  id: number;
  patient: number;
  patient_name: string;
  appointment: number;
  rating: number;
  comment: string;
  created_at: string;
}

interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
  specialty: string;
  bio: string;
  session_price?: number;
  session_duration?: number;
  availability?: AvailabilityBlock[];
  average_rating: number;
  review_count: number;
}

const DAY_ORDER: Record<string, number> = {
  Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7,
};

function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);

  const [reviewRating, setReviewRating] = useState<number | null>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [completedAppointments, setCompletedAppointments] = useState<{ id: number; doctor_name: string }[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<number | ''>('');

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [d, revs] = await Promise.all([
      doctorService.getById(Number(id)),
      reviewService.getDoctorReviews(Number(id)),
    ]);
    setDoctor(d);
    setReviews(revs);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (user && user.role === 'patient' && id) {
      appointmentService.getAll().then((all: any[]) => {
        const completed = (all as any[]).filter(
          (a: any) =>
            a.patient === user.id &&
            a.doctor === Number(id) &&
            a.status === 'completed',
        );
        setCompletedAppointments(
          completed.map((a: any) => ({ id: a.id, doctor_name: a.doctor_name }))
        );
      }).catch(() => {});
    }
  }, [user, id]);

  const reviewedAppointmentIds = new Set(reviews.map((r) => r.appointment));

  const handleSubmitReview = async () => {
    if (!selectedAppointment || !reviewRating) return;
    setSubmitting(true);
    setReviewError('');
    setReviewSuccess('');
    try {
      await reviewService.createReview(Number(id), {
        appointment: Number(selectedAppointment),
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewSuccess('Review submitted successfully!');
      setReviewComment('');
      setReviewRating(5);
      setSelectedAppointment('');
      loadData();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Failed to submit review')
          : 'Failed to submit review';
      setReviewError(msg);
    } finally {
      setSubmitting(false);
    }
  };

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
              Dr. {doctor.first_name} {doctor.last_name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Chip label={doctor.specialty} color="primary" size="small" />
              <Rating value={doctor.average_rating} precision={0.1} readOnly size="small" />
              <Typography variant="body2" color="text.secondary">
                ({doctor.review_count} {doctor.review_count === 1 ? 'review' : 'reviews'})
              </Typography>
            </Box>
            <Typography sx={{ mt: 2 }}>{doctor.bio}</Typography>
            {doctor.session_price ? (
              <Typography sx={{ mt: 2, fontWeight: 'bold' }} color="primary">
                Session Price: {doctor.session_price} EGP
              </Typography>
            ) : null}
            {doctor.session_duration ? (
              <Typography sx={{ mt: 1 }} color="text.secondary">
                Duration: {doctor.session_duration} min
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

          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Reviews ({reviews.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {reviews.length === 0 ? (
              <Typography color="text.secondary">No reviews yet.</Typography>
            ) : (
              reviews.map((r) => (
                <Box
                  key={r.id}
                  sx={{
                    py: 2,
                    '& + &': { borderTop: '1px solid', borderColor: 'divider' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {r.patient_name}
                    </Typography>
                    <Rating value={r.rating} readOnly size="small" />
                  </Box>
                  {r.comment && (
                    <Typography variant="body2" color="text.secondary">
                      {r.comment}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.disabled">
                    {new Date(r.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              ))
            )}
          </Paper>

          {user && user.role === 'patient' && completedAppointments.length > 0 && (
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Write a Review
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {reviewError && <Alert severity="error" sx={{ mb: 2 }}>{reviewError}</Alert>}
              {reviewSuccess && <Alert severity="success" sx={{ mb: 2 }}>{reviewSuccess}</Alert>}

              <TextField
                select
                label="Select Appointment"
                value={selectedAppointment}
                onChange={(e) => setSelectedAppointment(e.target.value as number | '')}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
                slotProps={{ select: { native: true } }}
              >
                <option value="">-- Select a completed appointment --</option>
                {completedAppointments
                  .filter((a) => !reviewedAppointmentIds.has(a.id))
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.doctor_name} - Appointment #{a.id}
                    </option>
                  ))}
              </TextField>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography>Rating:</Typography>
                <Rating
                  value={reviewRating}
                  onChange={(_, v) => setReviewRating(v)}
                  size="large"
                />
              </Box>

              <TextField
                label="Comment (optional)"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                fullWidth
                multiline
                rows={3}
                size="small"
                sx={{ mb: 2 }}
              />

              <Button
                variant="contained"
                onClick={handleSubmitReview}
                disabled={!selectedAppointment || submitting}
              >
                {submitting ? <CircularProgress size={24} /> : 'Submit Review'}
              </Button>
            </Paper>
          )}
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
