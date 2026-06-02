import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Pagination,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import TableChartIcon from '@mui/icons-material/TableChart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import adminService from '../services/admin.service';
import SearchBar from '../components/shared/SearchBar';
import FilterPanel from '../components/shared/FilterPanel';
import CalendarView from '../components/CalendarView';

interface Appointment {
  id: number;
  doctor_name: string;
  patient_name: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
}

const ITEMS_PER_PAGE = 8;

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const specialtiesFlat = [
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Ophthalmology',
  'Dentistry',
  'General',
];

const specialtyOptions = [
  { value: '', label: 'All Specialties' },
  ...specialtiesFlat.map((s) => ({ value: s, label: s })),
];

const statusColor: Record<string, 'warning' | 'success' | 'error' | 'info'> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'error',
  completed: 'info',
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'table' | 'calendar'>('table');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const response = await adminService.getAllAppointments().catch(() => ({ results: [] }));
        const all = Array.isArray(response) ? response : (response.results ?? []);
        setAppointments(all as Appointment[]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let result = appointments;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.doctor_name?.toLowerCase().includes(q) ||
          a.patient_name?.toLowerCase().includes(q),
      );
    }
    if (statusFilter) {
      result = result.filter((a) => a.status === statusFilter);
    }
    if (specialtyFilter) {
      result = result.filter((a) => a.specialty === specialtyFilter);
    }
    return result;
  }, [appointments, search, statusFilter, specialtyFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const displayed = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, specialtyFilter]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          All Appointments
        </Typography>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, v) => v && setView(v)}
          size="small"
        >
          <ToggleButton value="table">
            <TableChartIcon />
          </ToggleButton>
          <ToggleButton value="calendar">
            <CalendarMonthIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <SearchBar
            placeholder="Search doctor or patient..."
            onSearch={setSearch}
          />
        </Box>
        <FilterPanel
          label="Status"
          value={statusFilter}
          options={statusOptions}
          onChange={(v) => setStatusFilter(v)}
        />
        <FilterPanel
          label="Specialty"
          value={specialtyFilter}
          options={specialtyOptions}
          onChange={(v) => setSpecialtyFilter(v)}
        />
      </Box>

      {view === 'table' ? (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Doctor</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Patient</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Specialty</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayed.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      No appointments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  displayed.map((a) => (
                    <TableRow key={a.id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{a.doctor_name || '—'}</TableCell>
                      <TableCell>{a.patient_name || '—'}</TableCell>
                      <TableCell>{a.specialty || '—'}</TableCell>
                      <TableCell>{a.date}</TableCell>
                      <TableCell>{a.time || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={a.status}
                          color={statusColor[a.status] || 'default'}
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
              />
            </Box>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
            Showing {displayed.length} of {filtered.length} appointment{filtered.length !== 1 ? 's' : ''}
          </Typography>
        </>
      ) : (
        <CalendarView appointments={filtered} />
      )}
    </Box>
  );
}
