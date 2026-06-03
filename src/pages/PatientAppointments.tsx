import { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Typography, Divider, Button, Pagination, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import appointmentService from '../services/appointment.service';
import { selectUser } from '../store/authSlice';

interface Appointment {
  id: number;
  doctor: number;
  doctor_name: string;
  specialty: string;
  patient: number;
  patient_name: string;
  date: string;
  time: string;
  status: string;
  paid: boolean;
  refunded: boolean;
  notes: string;
}

function isWithin24h(date: string, time: string) {
  const apptDt = new Date(`${date}T${time}`);
  return apptDt.getTime() - Date.now() < 24 * 60 * 60 * 1000;
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return d;
  }
}

const ITEMS_PER_PAGE = 5;

function PatientAppointments() {
  const user = useSelector(selectUser);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const navigate = useNavigate();

  const [upcomingPage, setUpcomingPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  useEffect(() => {
    (async () => {
      const all = await appointmentService.getAll();
      setAppointments(all as Appointment[]);
    })();
  }, []);

  const patientAppointments = appointments.filter((a) => user && a.patient === user.id);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = patientAppointments
    .filter((a) => {
      const d = new Date(a.date);
      return d >= today && a.status !== 'cancelled';
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const history = patientAppointments
    .filter((a) => {
      const d = new Date(a.date);
      return d < today || a.status === 'cancelled' || a.status === 'completed';
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const upcomingPages = Math.ceil(upcoming.length / ITEMS_PER_PAGE);
  const historyPages = Math.ceil(history.length / ITEMS_PER_PAGE);

  const displayedUpcoming = upcoming.slice(
    (upcomingPage - 1) * ITEMS_PER_PAGE,
    upcomingPage * ITEMS_PER_PAGE,
  );
  const displayedHistory = history.slice(
    (historyPage - 1) * ITEMS_PER_PAGE,
    historyPage * ITEMS_PER_PAGE,
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h5">Upcoming Appointments</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {displayedUpcoming.length === 0 ? (
          <Typography color="text.secondary">No upcoming appointments.</Typography>
        ) : (
          <>
            {displayedUpcoming.map((a) => (
              <Paper key={a.id} sx={{ p: 2, mb: 2 }} elevation={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {a.doctor_name || 'Doctor'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {a.specialty}
                </Typography>
                <Typography variant="body1">
                  {formatDate(a.date)} — {a.time}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                  Status: <span style={{ fontWeight: 'bold' }}>{a.status.toUpperCase()}</span>
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/appointments/${a.id}`)}
                  >
                    View Details
                  </Button>
                  {a.status === 'pending' && (
                    <>
                      <Chip
                        label="PENDING PAYMENT"
                        color="warning"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => navigate(`/payment/${a.id}`)}
                      >
                        Pay Now
                      </Button>
                    </>
                  )}
                  {a.status === 'confirmed' && (
                    <>
                      <Chip
                        label="PAID & CONFIRMED"
                        color="success"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                      {!isWithin24h(a.date, a.time) && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={async () => {
                            const ok = a.paid
                              ? window.confirm('A full refund will be issued. Continue?')
                              : true;
                            if (!ok) return;
                            await appointmentService.cancel(a.id);
                            window.location.reload();
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                      {isWithin24h(a.date, a.time) && (
                        <Typography variant="caption" color="error">
                          Cannot cancel (within 24h)
                        </Typography>
                      )}
                    </>
                  )}
                </Box>
              </Paper>
            ))}
            {upcomingPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={upcomingPages}
                  page={upcomingPage}
                  onChange={(_, p) => setUpcomingPage(p)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h5">Appointment History</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {displayedHistory.length === 0 ? (
          <Typography color="text.secondary">No past appointments.</Typography>
        ) : (
          <>
            {displayedHistory.map((a) => (
              <Paper
                key={a.id}
                sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}
                elevation={0}
                variant="outlined"
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {a.doctor_name || 'Doctor'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {a.specialty}
                </Typography>
                <Typography variant="body2">
                  {formatDate(a.date)} — {a.time}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                  Status: {a.status}
                </Typography>
                {a.status === 'completed' && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    sx={{ mt: 1 }}
                    onClick={() => navigate(`/doctors/${a.doctor}`)}
                  >
                    Write a Review
                  </Button>
                )}
              </Paper>
            ))}
            {historyPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={historyPages}
                  page={historyPage}
                  onChange={(_, p) => setHistoryPage(p)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}

export default PatientAppointments;
