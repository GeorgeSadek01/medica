import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import dayjs from 'dayjs';

interface Appointment {
  id: number;
  doctor_name: string;
  patient_name: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
}

interface CalendarViewProps {
  appointments: Appointment[];
}

const statusColors: Record<string, 'warning' | 'success' | 'error' | 'info'> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'error',
  completed: 'info',
};

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView({ appointments }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    if (appointments.length > 0) {
      const sorted = [...appointments].sort((a, b) => a.date.localeCompare(b.date));
      return dayjs(sorted[0].date);
    }
    return dayjs();
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');
  const startDay = startOfMonth.day();

  const daysInMonth: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) {
    daysInMonth.push(null);
  }
  for (let d = 1; d <= endOfMonth.date(); d++) {
    daysInMonth.push(d);
  }

  const prevMonth = () => setCurrentDate(currentDate.subtract(1, 'month'));
  const nextMonth = () => setCurrentDate(currentDate.add(1, 'month'));

  const formatKey = (d: number) =>
    currentDate.format('YYYY-MM') + '-' + String(d).padStart(2, '0');

  const apptsByDate = appointments.reduce<Record<string, Appointment[]>>((acc, a) => {
    if (!acc[a.date]) acc[a.date] = [];
    acc[a.date].push(a);
    return acc;
  }, {});

  const selectedAppointments = selectedDate ? apptsByDate[selectedDate] || [] : [];

  const today = dayjs().format('YYYY-MM-DD');

  return (
    <Box>
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <IconButton onClick={prevMonth} size="small">
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {currentDate.format('MMMM YYYY')}
          </Typography>
          <IconButton onClick={nextMonth} size="small">
            <ChevronRightIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 0.5,
          }}
        >
          {DAYS_OF_WEEK.map((d) => (
            <Box
              key={d}
              sx={{
                textAlign: 'center',
                py: 0.5,
                fontWeight: 'bold',
                fontSize: '0.75rem',
                color: 'text.secondary',
              }}
            >
              {d}
            </Box>
          ))}
          {daysInMonth.map((day, idx) => {
            if (day === null) {
              return <Box key={`empty-${idx}`} />;
            }
            const dateStr = formatKey(day);
            const dayAppts = apptsByDate[dateStr] || [];
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;

            return (
              <Box
                key={dateStr}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                sx={{
                  border: '1px solid',
                  borderColor: isSelected ? 'primary.main' : isToday ? 'primary.light' : 'divider',
                  borderRadius: 1,
                  p: 0.5,
                  minHeight: 64,
                  cursor: 'pointer',
                  bgcolor: isSelected ? 'primary.50' : 'background.paper',
                  '&:hover': { bgcolor: 'action.hover' },
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: isToday ? 'bold' : 'regular',
                    color: isToday ? 'primary.main' : 'text.primary',
                  }}
                >
                  {day}
                </Typography>
                {dayAppts.length > 0 && (
                  <Box sx={{ mt: 0.5, display: 'flex', gap: 0.3, flexWrap: 'wrap' }}>
                    {dayAppts.slice(0, 3).map((a) => (
                      <Box
                        key={a.id}
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor:
                            a.status === 'confirmed'
                              ? 'success.main'
                              : a.status === 'pending'
                                ? 'warning.main'
                                : a.status === 'cancelled'
                                  ? 'error.main'
                                  : 'info.main',
                        }}
                      />
                    ))}
                    {dayAppts.length > 3 && (
                      <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                        +{dayAppts.length - 3}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Paper>

      {selectedDate && (
        <Paper sx={{ mt: 2, p: 2, borderRadius: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Appointments on {dayjs(selectedDate).format('dddd, MMMM D, YYYY')}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {selectedAppointments.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No appointments on this day.
            </Typography>
          ) : (
            selectedAppointments.map((a) => (
              <Box
                key={a.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1,
                  px: 1.5,
                  mb: 1,
                  bgcolor: 'grey.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {a.time} — {a.doctor_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {a.patient_name} &middot; {a.specialty}
                  </Typography>
                </Box>
                <Chip
                  label={a.status}
                  size="small"
                  color={statusColors[a.status] || 'default'}
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
            ))
          )}
        </Paper>
      )}
    </Box>
  );
}
