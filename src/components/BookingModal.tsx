import { useEffect, useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Divider,
  Alert,
  Chip,
  Paper,
} from '@mui/material';
import doctorService from '../services/doctor.service';
import appointmentService from '../services/appointment.service';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';

interface Slot {
  id: string;
  start_time: string;
  end_time: string;
  day: string;
  originalBlockId: number;
  slotIndex: number;
}

interface DoctorInfo {
  first_name: string;
  last_name: string;
  session_price?: number;
  session_duration?: number;
}

interface AppointmentData {
  id: number;
  doctor: number;
  doctor_name: string;
  patient: number;
  patient_name: string;
  date: string;
  time: string;
  time_slot: number | string;
  status: string;
}

interface AvailabilityBlock {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  doctorId: number;
  onBooked?: () => void;
}

interface DateOption {
  dateStr: string;
  dayName: string;
  dayNum: number;
  month: string;
}

const DAYS_LOOKAHEAD = 30;

function getWeekdayName(dateStr: string) {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  const [y, m, d] = parts.map((p) => parseInt(p, 10));
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', { weekday: 'long' });
}

function generateDateOptions(availability: AvailabilityBlock[]): DateOption[] {
  const availableDays = new Set(availability.map((b) => b.day));
  const dates: DateOption[] = [];
  const today = new Date();
  for (let i = 0; i < DAYS_LOOKAHEAD; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    if (availableDays.has(dayName)) {
      dates.push({
        dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
      });
    }
  }
  return dates;
}

function toMinutes(h: number, m: number): number {
  return h * 60 + m;
}

function formatMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function generateSlotsForDate(date: string, blocks: AvailabilityBlock[], durationMinutes: number): Slot[] {
  const weekday = getWeekdayName(date);
  const rawBlocks = blocks.filter((s) => s.day === weekday);
  const slots: Slot[] = [];

  rawBlocks.forEach((block) => {
    const [startH, startM] = (block.start_time || '00:00').split(':').map(Number);
    const [endH, endM] = (block.end_time || '23:59').split(':').map(Number);

    const startMinutes = toMinutes(startH, startM);
    const endMinutes = toMinutes(endH, endM);
    let currentMinutes = startMinutes;
    let slotIndex = 0;

    while (currentMinutes + durationMinutes <= endMinutes) {
      const nextMinutes = currentMinutes + durationMinutes;

      const sTime = formatMinutes(currentMinutes);
      const eTime = formatMinutes(nextMinutes);

      slots.push({
        id: `${block.id}-${slotIndex}`,
        start_time: sTime,
        end_time: eTime,
        day: block.day,
        originalBlockId: block.id,
        slotIndex,
      });

      currentMinutes = nextMinutes;
      slotIndex++;
    }
  });

  return slots;
}

function BookingModal({ open, onClose, doctorId, onBooked }: Props) {
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  const [availability, setAvailability] = useState<AvailabilityBlock[]>([]);
  const [date, setDate] = useState<string>('');
  const [slotsForDate, setSlotsForDate] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [alreadyBooked, setAlreadyBooked] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);

  const availableDates = useMemo(() => generateDateOptions(availability), [availability]);

  useEffect(() => {
    (async () => {
      const [av, doc] = await Promise.all([
        doctorService.getAvailability(doctorId),
        doctorService.getById(doctorId),
      ]);
      setAvailability(av);
      setDoctorInfo(doc);
    })();
  }, [doctorId, open]);

  useEffect(() => {
    if (!date) {
      setSlotsForDate([]);
      setSelectedSlot(null);
      setAlreadyBooked(false);
      return;
    }

    const slotDuration = doctorInfo?.session_duration ?? 30;
    const generatedSlots = generateSlotsForDate(date, availability, slotDuration);

    let slots = generatedSlots;
    const todayStr = new Date().toISOString().slice(0, 10);
    if (date === todayStr) {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      slots = slots.filter((s) => {
        const [h, m] = (s.start_time || '00:00').split(':').map(Number);
        return h * 60 + m > nowMinutes;
      });
    }

    (async () => {
      try {
        const [allAppts, doc] = await Promise.all([
          appointmentService.getAll(),
          doctorService.getById(doctorId),
        ]);
        const taken = new Set<string>();
        let patientAlreadyBooked = false;

        (allAppts as unknown as AppointmentData[]).forEach((ap) => {
          if (ap.doctor === doctorId && ap.date === date && ap.status !== 'cancelled') {
            if (ap.time) taken.add(ap.time);
            if (ap.time_slot !== undefined) taken.add(String(ap.time_slot));
            if (ap.patient === user?.id) patientAlreadyBooked = true;
          }
        });

        const bookedSlots: Record<string, string[]> =
          ((doc as unknown as Record<string, unknown>)?.bookedSlots as Record<string, string[]>) ?? {};
        const paidTimes: string[] = bookedSlots[date] ?? [];
        paidTimes.forEach((t) => taken.add(t));

        setAlreadyBooked(patientAlreadyBooked);
        setSlotsForDate(slots.filter((s) => !taken.has(s.id) && !taken.has(s.start_time)));
      } catch {
        setSlotsForDate(slots);
      }
    })();

    setSelectedSlot(null);
  }, [date, availability, doctorId, user?.id]);

  const handleBook = async () => {
    if (!selectedSlot || !date) return;
    setBookingError('');

    try {
      setConfirmOpen(false);
      const newAppointment = await appointmentService.book({
        doctor: doctorId,
        date,
        time_slot: selectedSlot.originalBlockId * 100 + selectedSlot.slotIndex,
        time: selectedSlot.start_time,
        patient: user?.id,
        patient_name: user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : '',
      });
      onClose();
      onBooked?.();
      navigate(`/payment/${newAppointment.id}`);
    } catch (err: unknown) {
      setConfirmOpen(true);
      setBookingError(
        err instanceof Error ? err.message : 'Failed to book appointment. Please try again.',
      );
    }
  };

  const handleDateSelect = (dateStr: string) => {
    setDate(dateStr);
    setSelectedSlot(null);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Book Appointment
            {doctorInfo && (
              <Chip
                label={`${doctorInfo.session_price ?? 0} EGP`}
                size="small"
                color="primary"
                sx={{ ml: 'auto', fontWeight: 600 }}
              />
            )}
          </Box>
        </DialogTitle>

        <DialogContent>
          {availability.length === 0 ? (
            <Alert severity="info" sx={{ mt: 1 }}>
              This doctor has not set their availability yet.
            </Alert>
          ) : (
            <>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                Select a Date
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                {availableDates.map((d) => {
                  const isSelected = date === d.dateStr;
                  const isToday = d.dateStr === new Date().toISOString().slice(0, 10);
                  return (
                    <Button
                      key={d.dateStr}
                      variant={isSelected ? 'contained' : isToday ? 'outlined' : 'outlined'}
                      color={isToday && !isSelected ? 'primary' : 'primary'}
                      onClick={() => handleDateSelect(d.dateStr)}
                      sx={{
                        minWidth: 72,
                        flexDirection: 'column',
                        py: 1,
                        px: 1.5,
                        borderColor: isSelected ? undefined : 'divider',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600, lineHeight: 1.2 }}
                      >
                        {d.dayName}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                        {d.dayNum}
                      </Typography>
                      <Typography variant="caption" sx={{ lineHeight: 1.2 }}>
                        {d.month}
                      </Typography>
                    </Button>
                  );
                })}
              </Box>

              {alreadyBooked && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  You already have an appointment with this doctor on this day.
                </Alert>
              )}

              {date && (
                <>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Select a Time
                  </Typography>
                  {slotsForDate.length === 0 ? (
                    <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                      <Typography color="text.secondary">No available slots for this date.</Typography>
                    </Paper>
                  ) : (
                    <Grid container spacing={1}>
                      {slotsForDate.map((s) => (
                        <Grid size={{ xs: 6 }} key={s.id}>
                          <Button
                            variant={selectedSlot?.id === s.id ? 'contained' : 'outlined'}
                            fullWidth
                            onClick={() => setSelectedSlot(s)}
                            disabled={alreadyBooked}
                            sx={{
                              py: 1.5,
                              borderColor: selectedSlot?.id === s.id ? undefined : 'divider',
                            }}
                          >
                            {s.start_time} &mdash; {s.end_time}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Close</Button>
          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={!selectedSlot || !date || alreadyBooked || availability.length === 0}
            variant="contained"
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setBookingError('');
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Booking</DialogTitle>
        <DialogContent>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Date</Typography>
              <Typography fontWeight={600}>{date}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Time</Typography>
              <Typography fontWeight={600}>
                {selectedSlot?.start_time} &mdash; {selectedSlot?.end_time}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Duration</Typography>
              <Typography fontWeight={600}>
                {doctorInfo?.session_duration ?? 30} min
              </Typography>
            </Box>
            {doctorInfo?.session_price ? (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Price</Typography>
                <Typography fontWeight={700} color="primary">
                  {doctorInfo.session_price} EGP
                </Typography>
              </Box>
            ) : null}
          </Paper>

          {bookingError && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {bookingError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setConfirmOpen(false);
              setBookingError('');
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleBook}>
            Proceed to Payment
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default BookingModal;
