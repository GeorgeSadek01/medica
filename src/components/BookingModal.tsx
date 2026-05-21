import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  Box,
} from '@mui/material';
import doctorService from '../services/doctor.service';
import appointmentService from '../services/appointment.service';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';

interface Props {
  open: boolean;
  onClose: () => void;
  doctorId: number;
  onBooked?: () => void;
}

function getWeekdayName(dateStr: string) {
  // dateStr expected as YYYY-MM-DD; construct local Date to avoid UTC offsets
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  const [y, m, d] = parts.map((p) => parseInt(p, 10));
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', { weekday: 'long' });
}

function BookingModal({ open, onClose, doctorId, onBooked }: Props) {
  const user = useSelector(selectUser);
  const [date, setDate] = useState<string>('');
  // compute today's date in local timezone as YYYY-MM-DD
  const _today = new Date();
  const minDate = `${_today.getFullYear()}-${String(_today.getMonth() + 1).padStart(2, '0')}-${String(
    _today.getDate(),
  ).padStart(2, '0')}`;
  const [availability, setAvailability] = useState<any[]>([]);
  const [slotsForDate, setSlotsForDate] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [alreadyBooked, setAlreadyBooked] = useState(false);

  useEffect(() => {
    (async () => {
      const av = await doctorService.getAvailability(doctorId);
      setAvailability(av);
    })();
  }, [doctorId, open]);

  useEffect(() => {
    if (!date) {
      setSlotsForDate([]);
      setSelectedSlot(null);
      setAlreadyBooked(false);
      return;
    }
    const weekday = getWeekdayName(date);
    let rawBlocks = availability.filter((s) => s.day === weekday);

    // Generate 1-hour slots from availability blocks
    let generatedSlots: any[] = [];
    rawBlocks.forEach((block) => {
      const [startH, startM] = (block.start_time || '00:00').split(':').map(Number);
      const [endH, endM] = (block.end_time || '23:59').split(':').map(Number);
      
      let currentH = startH;
      let currentM = startM;
      let slotIndex = 0;
      
      while (currentH < endH || (currentH === endH && currentM < endM)) {
        let nextH = currentH + 1;
        let nextM = currentM;
        if (nextH > endH || (nextH === endH && nextM > endM)) {
          nextH = endH;
          nextM = endM;
        }
        
        const sTime = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;
        const eTime = `${String(nextH).padStart(2, '0')}:${String(nextM).padStart(2, '0')}`;
        
        generatedSlots.push({
          id: `${block.id}-${slotIndex}`,
          start_time: sTime,
          end_time: eTime,
          day: block.day,
          originalBlockId: block.id
        });
        
        currentH = nextH;
        currentM = nextM;
        slotIndex++;
      }
    });

    let slots = generatedSlots;

    // if selected date is today, filter out slots that already passed
    const todayStr = new Date().toISOString().slice(0, 10);
    if (date === todayStr) {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      slots = slots.filter((s) => {
        const [h, m] = (s.start_time || '00:00').split(':').map(Number);
        const slotMinutes = h * 60 + m;
        return slotMinutes > nowMinutes;
      });
    }
    (async () => {
      // remove slots already booked for this doctor on the selected date
      try {
        const allAppts = await appointmentService.getAll();
        const taken = new Set<number | string>();
        let patientAlreadyBooked = false;

        allAppts.forEach((ap: any) => {
          if (ap.doctor === doctorId && ap.date === date && ap.status !== 'cancelled') {
            if (ap.time) taken.add(ap.time);
            if (ap.time_slot !== undefined) taken.add(ap.time_slot);
            // Block the patient if they already have any active appointment (pending OR confirmed)
            if (ap.patient === user?.id) patientAlreadyBooked = true;
          }
        });

        // Also cross-check the doctor's persisted bookedSlots map (set after payment)
        const doc = await doctorService.getById(doctorId);
        const bookedSlots: Record<string, string[]> = (doc as any)?.bookedSlots ?? {};
        const paidTimes: string[] = bookedSlots[date] ?? [];
        paidTimes.forEach((t) => taken.add(t));

        setAlreadyBooked(patientAlreadyBooked);
        const availableSlots = slots.filter((s) => !taken.has(s.id) && !taken.has(s.start_time));
        setSlotsForDate(availableSlots);
      } catch (err) {
        setSlotsForDate(slots);
      }
    })();
    setSelectedSlot(null);
  }, [date, availability]);

  const navigate = useNavigate();

  const [doctorInfo, setDoctorInfo] = useState<any | null>(null);
  useEffect(() => {
    (async () => {
      const doc = await doctorService.getById(doctorId);
      setDoctorInfo(doc);
    })();
  }, [doctorId]);

  const handleBook = async () => {
    if (!selectedSlot || !date) return;
    setBookingError('');

    try {
      setConfirmOpen(false);
      const newAppointment = await appointmentService.book({
        doctor: doctorId,
        date,
        time_slot: selectedSlot.id,
        time: selectedSlot.start_time,
        patient: user?.id,
        patient_name: user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : '',
      } as any);
      onClose();
      onBooked && onBooked();
      navigate(`/payment/${newAppointment.id}`);
    } catch (err: any) {
      // Service throws if patient already has an appointment on this day
      setConfirmOpen(true);
      setBookingError(err?.message ?? 'Failed to book appointment. Please try again.');
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth>
        <DialogTitle>Book Appointment</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <TextField
              label="Date"
              type="date"
              variant="outlined"
              value={date}
              onChange={(e) => {
                const raw = e.target.value;

                // normalize input to YYYY-MM-DD whether user typed MM/DD/YYYY or already YYYY-MM-DD
                let normalized = raw;
                let y = 0,
                  m = 0,
                  d = 0;
                if (raw.includes('/')) {
                  // expect MM/DD/YYYY
                  const parts = raw.split('/');
                  if (parts.length === 3) {
                    m = parseInt(parts[0], 10) || 0;
                    d = parseInt(parts[1], 10) || 0;
                    y = parseInt(parts[2], 10) || 0;
                    normalized = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(
                      d,
                    ).padStart(2, '0')}`;
                  }
                } else if (raw.includes('-')) {
                  const parts = raw.split('-');
                  if (parts.length === 3) {
                    y = parseInt(parts[0], 10) || 0;
                    m = parseInt(parts[1], 10) || 0;
                    d = parseInt(parts[2], 10) || 0;
                  }
                }

                try {
                  // construct local dates to compare (avoid timezone offsets)
                  const sel = new Date(y || Number(normalized.split('-')[0]), (m || Number(normalized.split('-')[1])) - 1, d || Number(normalized.split('-')[2]));
                  const min = new Date(minDate.split('-')[0] as unknown as number, Number(minDate.split('-')[1]) - 1, Number(minDate.split('-')[2]));
                  if (isNaN(sel.getTime())) {
                    setDate(minDate);
                  } else if (sel.getTime() < min.getTime()) {
                    setDate(minDate);
                  } else {
                    setDate(normalized);
                  }
                } catch {
                  setDate(minDate);
                }
              }}
              {...({ InputLabelProps: { shrink: true } } as any)}
              inputProps={{ min: minDate }}
            />
          </Box>

          <Typography sx={{ mt: 2 }}>Available slots for selected date:</Typography>
          {alreadyBooked && (
            <Typography color="warning.main" sx={{ mt: 1, mb: 1, fontSize: '0.875rem', fontWeight: 'bold' }}>
              ⚠️ You already have an appointment with this doctor on this day. You cannot book another.
            </Typography>
          )}
          <List>
            {slotsForDate.length === 0 && (
              <ListItem>
                <ListItemText primary="No available slots for this date" />
              </ListItem>
            )}
            {slotsForDate.map((s) => (
              <ListItem key={s.id} disablePadding>
                <ListItemButton selected={selectedSlot?.id === s.id} onClick={() => setSelectedSlot(s)} disabled={alreadyBooked}>
                  <ListItemText primary={`${s.start_time} — ${s.end_time}`} secondary={s.day} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={!selectedSlot || !date || alreadyBooked}
            variant="contained"
          >
            Book
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => { setConfirmOpen(false); setBookingError(''); }}>
        <DialogTitle>Confirm Booking</DialogTitle>
        <DialogContent>
          <Typography>
            Date: {date}
          </Typography>
          <Typography>
            Time: {selectedSlot?.start_time} — {selectedSlot?.end_time}
          </Typography>
          {doctorInfo && doctorInfo.session_price && (
            <Typography sx={{ mt: 1, fontWeight: 'bold' }}>
              Session Price: {doctorInfo.session_price} EGP
            </Typography>
          )}
          {bookingError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {bookingError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setConfirmOpen(false); setBookingError(''); }}>Cancel</Button>
          <Button variant="contained" onClick={handleBook}>Proceed to Payment</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default BookingModal;
