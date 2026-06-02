import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
} from '@mui/material';

import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DescriptionIcon from '@mui/icons-material/Description';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';

import adminService from '../services/admin.service';
import doctorService from '../services/doctor.service';
import { useAppDispatch, useAppSelector } from '../store';
import { logout, selectAuth } from '../store/authSlice';

interface Appointment {
  id: number;
  doctor: number;
  doctor_name: string;
  patient: number;
  patient_name: string;
  date: string;
  time: string;
  time_slot: number;
  status: string;
  notes: string;
  doctor_notes: string;
}

function ReuploadForm({ onCancel, onDone }: { onCancel: () => void; onDone: () => void }) {
  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!identityFile || !certificateFile) {
      setError('Please select both files');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('identity_document', identityFile);
      fd.append('medical_certificate', certificateFile);
      await doctorService.uploadDocuments(fd);
      onDone();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ mt: 2, textAlign: 'left' }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Select new documents</Typography>
      <Button variant="outlined" size="small" component="label" sx={{ mr: 1, mb: 1 }}>
        {identityFile ? identityFile.name : 'Identity Document'}
        <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setIdentityFile(e.target.files?.[0] ?? null)} />
      </Button>
      <Button variant="outlined" size="small" component="label" sx={{ mr: 1, mb: 1 }}>
        {certificateFile ? certificateFile.name : 'Medical Certificate'}
        <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setCertificateFile(e.target.files?.[0] ?? null)} />
      </Button>
      <Box sx={{ mt: 1 }}>
        <Button size="small" variant="contained" onClick={handleSubmit} disabled={uploading} sx={{ mr: 1 }}>
          {uploading ? 'Uploading...' : 'Submit'}
        </Button>
        <Button size="small" onClick={onCancel}>Cancel</Button>
      </Box>
      {error && <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>{error}</Typography>}
    </Box>
  );
}

export default function DoctorDashboardPage() {
  const { user } = useAppSelector(selectAuth);
  const [confirmedAppointments, setConfirmedAppointments] = useState<Appointment[]>([]);
  const [cancelledAppointments, setCancelledAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [doctorName, setDoctorName] = useState('Doctor');
  const [docStatus, setDocStatus] = useState<'none' | 'pending' | 'rejected' | 'approved'>('none');
  const [rejectionReason, setRejectionReason] = useState('');
  const [resubmitting, setResubmitting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getDashboardData();
      setStats(data.statistics || {});
      setConfirmedAppointments(data.confirmed_appointments || []);
      setCancelledAppointments(data.cancelled_appointments || []);
      setDoctorName(`Dr. ${user?.first_name} ${user?.last_name}`);

      if (user?.role === 'doctor' && !user.verified) {
        try {
          const docs = await adminService.getDocuments();
          const myDoc = (docs as any[]).find((d: any) => d.doctor_id === user.id);
          if (myDoc) {
            setDocStatus(myDoc.status);
            setRejectionReason(myDoc.rejection_reason || '');
          }
        } catch {
          // ignore
        }
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (user) fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const totalBookings = stats.total_appointments ?? 0;
  const confirmedCount = stats.confirmed_and_completed_count ?? 0;
  const cancelledCount = stats.cancelled_count ?? 0;

  const getStatusChip = (status: string) => {
    const configs: Record<
      string,
      { label: string; color: 'success' | 'error' | 'info' | 'default' }
    > = {
      confirmed: { label: 'Confirmed', color: 'success' },
      cancelled: { label: 'Cancelled', color: 'error' },
      completed: { label: 'Completed', color: 'info' },
    };
    const config = configs[status] || { label: status, color: 'default' };
    return (
      <Chip label={config.label} color={config.color} size="small" sx={{ fontWeight: 'bold' }} />
    );
  };

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}
      >
        <CircularProgress size={45} />
      </Box>
    );
  }

  if (user && user.role === 'doctor' && !user.verified) {
    const isRejected = docStatus === 'rejected';
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)', mx: -3, mt: -3, px: 3, bgcolor: 'background.default', width: { md: '100vw' }, ml: { md: '-240px' } }}>
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, maxWidth: 480 }}>
          <GppMaybeIcon sx={{ fontSize: 64, color: isRejected ? 'error.main' : 'warning.main', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            {isRejected ? 'Account Verification Rejected' : 'Account Pending Verification'}
          </Typography>
          {isRejected ? (
            <>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Your submitted documents did not meet the verification requirements.
              </Typography>
              {rejectionReason && (
                <Typography variant="body2" color="error" sx={{ mb: 1, fontWeight: 600 }}>
                  Reason: {rejectionReason}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                Please contact support or re-submit your documents for review.
              </Typography>
              <Button
                variant="contained"
                size="small"
                disabled={resubmitting}
                onClick={() => setResubmitting(true)}
              >
                Re-upload Documents
              </Button>
              {resubmitting && (
                <ReuploadForm
                  onCancel={() => setResubmitting(false)}
                  onDone={() => {
                    setResubmitting(false);
                    setDocStatus('pending');
                  }}
                />
              )}
            </>
          ) : (
            <>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Your doctor account is awaiting approval from an administrator.
                You will not be able to manage appointments or access patient data until your account is verified.
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Please check back later or contact support.
              </Typography>
            </>
          )}
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <LocalHospitalIcon fontSize="large" /> {doctorName} Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          Welcome back! Real-time overview of your practice statistics and schedule.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={2} sx={{ borderLeft: '6px solid #1976d2', borderRadius: 4 }}>
            <CardContent
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 2.5,
              }}
            >
              <Box>
                <Typography
                  color="text.secondary"
                  variant="subtitle2"
                  sx={{ fontWeight: 700, textTransform: 'uppercase' }}
                >
                  Total Bookings
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 0.5, color: '#1976d2' }}>
                  {totalBookings}
                </Typography>
              </Box>
              <CalendarTodayIcon sx={{ fontSize: 40, color: '#1976d2', opacity: 0.7 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={2} sx={{ borderLeft: '6px solid #2e7d32', borderRadius: 4 }}>
            <CardContent
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 2.5,
              }}
            >
              <Box>
                <Typography
                  color="text.secondary"
                  variant="subtitle2"
                  sx={{ fontWeight: 700, textTransform: 'uppercase' }}
                >
                  Confirmed Slots
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 0.5, color: '#2e7d32' }}>
                  {confirmedCount}
                </Typography>
              </Box>
              <CheckCircleIcon sx={{ fontSize: 40, color: '#2e7d32', opacity: 0.7 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={2} sx={{ borderLeft: '6px solid #d32f2f', borderRadius: 4 }}>
            <CardContent
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 2.5,
              }}
            >
              <Box>
                <Typography
                  color="text.secondary"
                  variant="subtitle2"
                  sx={{ fontWeight: 700, textTransform: 'uppercase' }}
                >
                  Cancelled Slots
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 0.5, color: '#d32f2f' }}>
                  {cancelledCount}
                </Typography>
              </Box>
              <CancelIcon sx={{ fontSize: 40, color: '#d32f2f', opacity: 0.7 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12 }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
              Active & Confirmed Schedule
            </Typography>
            {confirmedAppointments.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ py: 2, fontStyle: 'italic' }}
              >
                No active or confirmed appointments found for your profile.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Patient Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Time Slot</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Patient Message</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {confirmedAppointments.map((app) => (
                      <TableRow key={app.id} hover>
                        <TableCell sx={{ fontWeight: 500, py: 1.5 }}>
                          {app.patient_name || `Patient #${app.patient}`}
                        </TableCell>
                        <TableCell>{app.date}</TableCell>
                        <TableCell>{app.time || `Slot ${app.time_slot}`}</TableCell>
                        <TableCell
                          sx={{
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {app.notes || '—'}
                        </TableCell>
                        <TableCell>{getStatusChip(app.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'text.secondary' }}>
              Past & Cancelled History
            </Typography>
            {cancelledAppointments.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ py: 2, fontStyle: 'italic' }}
              >
                No cancelled or past appointment logs.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Patient Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Time Slot</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Doctor Logs / Diagnosis</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cancelledAppointments.map((app) => (
                      <TableRow key={app.id} hover>
                        <TableCell sx={{ py: 1.5 }}>
                          {app.patient_name || `Patient #${app.patient}`}
                        </TableCell>
                        <TableCell>{app.date}</TableCell>
                        <TableCell>{app.time || `Slot ${app.time_slot}`}</TableCell>
                        <TableCell>{getStatusChip(app.status)}</TableCell>
                        <TableCell
                          sx={{
                            maxWidth: 250,
                            fontStyle: app.doctor_notes ? 'normal' : 'italic',
                            color: 'text.secondary',
                          }}
                        >
                          {app.doctor_notes ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <DescriptionIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                              {app.doctor_notes}
                            </Box>
                          ) : (
                            'No notes attached.'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
