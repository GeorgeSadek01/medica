import { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, MenuItem, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import doctorService from '../services/doctor.service';

function HomePage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const doctors = await doctorService.getAll();
      const uniq = Array.from(new Set(doctors.map((d) => d.specialty))).sort();
      setSpecialties(uniq);
    })();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (name) params.set('name', name);
    if (specialty) params.set('specialty', specialty);
    navigate(`/search/results?${params.toString()}`);
  };

  return (
    <Box sx={{ mt: 4, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h3" gutterBottom>
        Find a Doctor
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Search doctors by name or filter by specialty.
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Doctor name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />

        <TextField
          select
          label="Specialty"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">All specialties</MenuItem>
          {specialties.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>

        <Button variant="contained" onClick={handleSearch} sx={{ minWidth: 120 }}>
          Search
        </Button>
      </Stack>

      <Typography variant="h6" sx={{ mt: 4 }}>
        Quick links
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
        <Button onClick={() => navigate('/search/results')}>Browse all doctors</Button>
      </Stack>
    </Box>
  );
}

export default HomePage;
