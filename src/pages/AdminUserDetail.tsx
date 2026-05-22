import { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, Avatar, Divider, Pagination, Button, Snackbar, Alert,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';
import { useParams, useNavigate } from 'react-router-dom';
import adminService from '../services/admin.service';

const ITEMS_PER_PAGE = 5;

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any | null>(null);
  const [doctorInfo, setDoctorInfo] = useState<any | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const loadUser = async () => {
    if (!id) return;
    const u = await adminService.getUserById(Number(id));
    setUser(u);

    if (u?.role === 'doctor') {
      const stored = localStorage.getItem('medica_db_doctors');
      if (stored) {
        const docs = JSON.parse(stored);
        const match = docs.find((d: any) => d.id === u.id || d.contact === u.email);
        setDoctorInfo(match || null);
      }
    }

    const appts = await adminService.getAppointmentsByUser(Number(id), u?.role === 'doctor');
    setAppointments(appts);
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, [id]);

  useEffect(() => {
    setPage(1);
  }, [appointments.length]);

  const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);
  const displayed = useMemo(
    () => appointments.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE),
    [appointments, page],
  );

  const handleVerifyToggle = async () => {
    if (!user) return;
    const newVerified = !(user.verified ?? false);
    await adminService.verifyDoctor(user.id, newVerified);
    setUser({ ...user, verified: newVerified });
    setSnackbar({ open: true, message: `Doctor ${newVerified ? 'verified' : 'unverified'} successfully.` });
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (!user) return <Typography sx={{ p: 3, textAlign: 'center' }}>User not found.</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      <Typography
        variant="body2"
        sx={{ mb: 2, cursor: 'pointer', color: 'primary.main' }}
        onClick={() => navigate('/admin/users')}
      >
        &larr; Back to Users
      </Typography>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 28 }}>
            {user.first_name?.[0]}{user.last_name?.[0]}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {user.first_name} {user.last_name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5, flexWrap: 'wrap' }}>
              <Chip label={user.role} size="small" color={user.role === 'doctor' ? 'primary' : user.role === 'admin' ? 'warning' : 'default'} />
              <Chip
                label={(user.is_active ?? true) ? 'Active' : 'Inactive'}
                size="small"
                color={(user.is_active ?? true) ? 'success' : 'error'}
              />
              {user.role === 'doctor' && (
                <Chip
                  icon={user.verified ? <VerifiedIcon /> : <GppMaybeIcon />}
                  label={user.verified ? 'Verified' : 'Pending Verification'}
                  size="small"
                  color={user.verified ? 'success' : 'warning'}
                />
              )}
            </Box>
          </Box>
          {user.role === 'doctor' && (
            <Button
              variant={user.verified ? 'outlined' : 'contained'}
              color={user.verified ? 'warning' : 'success'}
              startIcon={user.verified ? <GppMaybeIcon /> : <VerifiedIcon />}
              onClick={handleVerifyToggle}
              size="small"
            >
              {user.verified ? 'Revoke Verification' : 'Verify Doctor'}
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2"><strong>Email:</strong> {user.email}</Typography>
        {user.phone ? <Typography variant="body2"><strong>Phone:</strong> {user.phone}</Typography> : null}
        {doctorInfo && (
          <>
            <Typography variant="body2"><strong>Specialty:</strong> {doctorInfo.specialty}</Typography>
            {doctorInfo.bio && <Typography variant="body2"><strong>Bio:</strong> {doctorInfo.bio}</Typography>}
            {doctorInfo.session_price != null && (
              <Typography variant="body2"><strong>Session Price:</strong> {doctorInfo.session_price} EGP</Typography>
            )}
          </>
        )}
      </Paper>

      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        {user.role === 'doctor' ? 'Doctor Appointments' : 'Patient Appointments'}
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f9fafb' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>{user.role === 'doctor' ? 'Patient' : 'Doctor'}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Specialty</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayed.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No appointments found.
                </TableCell>
              </TableRow>
            ) : (
              displayed.map((a: any) => (
                <TableRow key={a.id} hover>
                  <TableCell>{user.role === 'doctor' ? a.patient_name : a.doctor_name}</TableCell>
                  <TableCell>{a.specialty}</TableCell>
                  <TableCell>{a.date}</TableCell>
                  <TableCell>{a.time}</TableCell>
                  <TableCell>
                    <Chip
                      label={a.status}
                      size="small"
                      color={
                        a.status === 'confirmed' ? 'success' :
                        a.status === 'pending' ? 'warning' :
                        a.status === 'cancelled' ? 'error' : 'info'
                      }
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
        Showing {displayed.length} of {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
      </Typography>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
