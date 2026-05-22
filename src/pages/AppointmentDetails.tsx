import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import appointmentService from '../services/appointment.service';
import doctorService from '../services/doctor.service';

interface AppointmentData {
  id: number;
  doctor: number;
  doctor_name: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
}

interface DoctorData {
  first_name: string;
  last_name: string;
  specialty: string;
}

const AppointmentDetails: React.FC = () => {
  const { id } = useParams();
  const [appt, setAppt] = useState<AppointmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      const a = await appointmentService.getById(Number(id));
      if (a && (!a.doctor_name || !a.specialty)) {
        const doc = (await doctorService.getById(a.doctor)) as DoctorData | null;
        if (doc) {
          a.doctor_name = `${doc.first_name} ${doc.last_name}`;
          a.specialty = doc.specialty;
        }
      }
      setAppt(a);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <Typography sx={{ p: 3 }}>Loading...</Typography>;
  if (!appt) return <Typography sx={{ p: 3 }}>Appointment not found.</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5">Appointment Details</Typography>
        <Typography sx={{ mt: 1 }}>Doctor: {appt.doctor_name}</Typography>
        <Typography>Specialty: {appt.specialty}</Typography>
        <Typography>Date: {appt.date}</Typography>
        <Typography>Time: {appt.time}</Typography>
        <Typography>Status: {appt.status}</Typography>

        <Box sx={{ mt: 2 }}>
          {appt.status !== 'cancelled' && (
            <Button
              onClick={async () => {
                await appointmentService.cancel(appt.id);
                navigate('/dashboard/patient');
              }}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AppointmentDetails;
