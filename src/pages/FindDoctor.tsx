import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Card,
  CardContent,
  Stack,
  InputAdornment,
  Pagination,
  Chip,
  CircularProgress,
  Rating,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate, useSearchParams } from 'react-router-dom';
import doctorService from '../services/doctor.service';

interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
  specialty: string;
  bio: string;
  average_rating: number;
  review_count: number;
}

const ITEMS_PER_PAGE = 6;

function FindDoctor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState(searchParams.get('name') ?? '');
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') ?? '');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const params: { name?: string; specialty?: string } = {};
      if (name) params.name = name;
      if (specialty) params.specialty = specialty;
      const res = await doctorService.getAll(Object.keys(params).length ? params : undefined);
      setDoctors(res as Doctor[]);
      setLoading(false);
      setPage(1);
    })();
  }, [name, specialty]);

  useEffect(() => {
    (async () => {
      const all = await doctorService.getAll();
      const uniq = Array.from(new Set(all.map((d: any) => d.specialty))).sort() as string[];
      setSpecialties(uniq);
    })();
  }, []);

  const totalPages = Math.ceil(doctors.length / ITEMS_PER_PAGE);
  const displayed = doctors.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Find a Doctor
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Search by name or filter by specialty to find the right doctor for you.
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          mb: 4,
          p: 2.5,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}
      >
        <TextField
          placeholder="Search by doctor name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          size="small"
          sx={{ flex: { xs: '1 1 100%', sm: '1 1 240px' }, minWidth: 200 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          size="small"
          sx={{ minWidth: 180 }}
          slotProps={{
            select: {
              displayEmpty: true,
              renderValue: (selected: unknown) =>
                (selected as string) || 'All Specialties',
            },
          }}
        >
          <MenuItem value="">All Specialties</MenuItem>
          {specialties.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
        {(name || specialty) && (
          <Button
            size="small"
            onClick={() => {
              setName('');
              setSpecialty('');
            }}
          >
            Clear
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : doctors.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No doctors found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search or filter criteria.
          </Typography>
        </Box>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} found
          </Typography>

          <Stack spacing={2}>
            {displayed.map((d) => (
              <Card
                key={d.id}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
                }}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 2,
                    flexWrap: 'wrap',
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Dr. {d.first_name} {d.last_name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Chip
                        label={d.specialty}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Rating value={d.average_rating} precision={0.1} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary">
                          ({d.review_count})
                        </Typography>
                      </Box>
                    </Box>
                    {d.bio && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1.5, maxWidth: 600 }}
                      >
                        {d.bio}
                      </Typography>
                    )}
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate(`/doctors/${d.id}`)}
                    sx={{ flexShrink: 0 }}
                  >
                    View Profile
                  </Button>
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
    </Container>
  );
}

export default FindDoctor;
