import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Stack, Pagination } from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import doctorService from '../services/doctor.service';

interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
  specialty: string;
  bio: string;
}

const ITEMS_PER_PAGE = 5;

function DoctorResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      const name = searchParams.get('name') ?? undefined;
      const specialty = searchParams.get('specialty') ?? undefined;
      const res = await doctorService.getAll({ name, specialty });
      setDoctors(res as Doctor[]);
    })();
  }, [searchParams]);

  const totalPages = Math.ceil(doctors.length / ITEMS_PER_PAGE);
  const displayed = doctors.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Doctor Search Results
      </Typography>

      {doctors.length === 0 ? (
        <Typography color="text.secondary">No doctors found.</Typography>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} found
          </Typography>

          <Stack spacing={2}>
            {displayed.map((d) => (
              <Card key={d.id} variant="outlined">
                <CardContent
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Box>
                    <Typography variant="h6">
                      {d.first_name} {d.last_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {d.specialty}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {d.bio}
                    </Typography>
                  </Box>
                  <Box>
                    <Button variant="contained" onClick={() => navigate(`/doctors/${d.id}`)}>
                      View profile
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

export default DoctorResults;
