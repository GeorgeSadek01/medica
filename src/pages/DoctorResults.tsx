import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Stack } from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import doctorService from '../services/doctor.service';

interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
  specialty: string;
  bio: string;
}

const DoctorResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    (async () => {
      const name = searchParams.get('name') ?? undefined;
      const specialty = searchParams.get('specialty') ?? undefined;
      const res = await doctorService.getAll({ name, specialty });
      setDoctors(res as Doctor[]);
    })();
  }, [searchParams]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Doctor Search Results
      </Typography>

      {doctors.length === 0 ? (
        <Typography color="text.secondary">No doctors found.</Typography>
      ) : (
        <Stack spacing={2} sx={{ mt: 2 }}>
          {doctors.map((d) => (
            <Card key={d.id} variant="outlined">
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">{d.first_name} {d.last_name}</Typography>
                  <Typography variant="body2" color="text.secondary">{d.specialty}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>{d.bio}</Typography>
                </Box>
                <Box>
                  <Button variant="contained" onClick={() => navigate(`/doctors/${d.id}`)}>View profile</Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default DoctorResults;
