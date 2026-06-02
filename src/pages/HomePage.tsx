import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Stack,
  Card,
  CardContent,
  InputAdornment,
  keyframes,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HealingIcon from '@mui/icons-material/Healing';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PsychologyIcon from '@mui/icons-material/Psychology';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import BiotechIcon from '@mui/icons-material/Biotech';
import CoronavirusIcon from '@mui/icons-material/Coronavirus';
import ShieldIcon from '@mui/icons-material/Shield';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupsIcon from '@mui/icons-material/Groups';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

import doctorService from '../services/doctor.service';
import heroImage from '../assets/hero.png';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.5); }
  50% { box-shadow: 0 0 0 18px rgba(255,255,255,0); }
`;

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView] as const;
}

function AnimatedCounter({
  end,
  duration = 2000,
  start,
}: {
  end: number;
  duration?: number;
  start: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number | null = null;
    let raf: number;

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, start]);

  return <>{count}</>;
}

const specialtyIcons: Record<string, React.ReactNode> = {
  Cardiology: <FavoriteIcon sx={{ fontSize: 40 }} />,
  Dermatology: <VisibilityIcon sx={{ fontSize: 40 }} />,
  Pediatrics: <ChildCareIcon sx={{ fontSize: 40 }} />,
  Neurology: <PsychologyIcon sx={{ fontSize: 40 }} />,
  Orthopedics: <HealingIcon sx={{ fontSize: 40 }} />,
  Radiology: <BiotechIcon sx={{ fontSize: 40 }} />,
  'General Medicine': <MedicalServicesIcon sx={{ fontSize: 40 }} />,
  Pulmonology: <CoronavirusIcon sx={{ fontSize: 40 }} />,
};

const defaultSpecialtyIcon = <MedicalServicesIcon sx={{ fontSize: 40 }} />;

const stats = [
  {
    label: 'Experienced Doctors',
    value: 50,
    icon: <LocalHospitalIcon sx={{ fontSize: 36, color: 'primary.main' }} />,
  },
  {
    label: 'Happy Patients',
    value: 5000,
    icon: <GroupsIcon sx={{ fontSize: 36, color: 'primary.main' }} />,
  },
  {
    label: 'Specialties',
    value: 20,
    icon: <MedicalServicesIcon sx={{ fontSize: 36, color: 'primary.main' }} />,
  },
  {
    label: 'Satisfaction Rate',
    suffix: '%',
    value: 99,
    icon: <VerifiedUserIcon sx={{ fontSize: 36, color: 'primary.main' }} />,
  },
];

const steps = [
  {
    icon: <SearchIcon sx={{ fontSize: 36 }} />,
    title: 'Search Doctor',
    desc: 'Find the right specialist by name or specialty from our verified team.',
  },
  {
    icon: <CalendarMonthIcon sx={{ fontSize: 36 }} />,
    title: 'Book Appointment',
    desc: 'Choose a convenient date and time. Instant confirmation, no waiting.',
  },
  {
    icon: <HealingIcon sx={{ fontSize: 36 }} />,
    title: 'Get Treatment',
    desc: 'Visit your doctor in-clinic or online. Your health journey starts here.',
  },
];

const features = [
  {
    icon: <VerifiedUserIcon sx={{ fontSize: 36 }} />,
    title: 'Verified Doctors',
    desc: 'All doctors are licensed and background-checked.',
  },
  {
    icon: <AccessTimeIcon sx={{ fontSize: 36 }} />,
    title: '24/7 Booking',
    desc: 'Book appointments any time, day or night.',
  },
  {
    icon: <ShieldIcon sx={{ fontSize: 36 }} />,
    title: 'Secure & Private',
    desc: 'Your medical data is encrypted and protected.',
  },
  {
    icon: <SupportAgentIcon sx={{ fontSize: 36 }} />,
    title: 'Dedicated Support',
    desc: 'Our team is always ready to assist you.',
  },
];

function HomePage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);

  const [statsRef, statsInView] = useInView(0.3);
  const [stepsRef, stepsInView] = useInView(0.2);

  useEffect(() => {
    (async () => {
      const doctors = await doctorService.getAll();
      const uniq = Array.from(new Set(doctors.map((d: any) => d.specialty))).sort() as string[];
      setSpecialties(uniq);
    })();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (name) params.set('name', name);
    if (specialty) params.set('specialty', specialty);
    navigate(`/search/results?${params.toString()}`);
  };

  const handleSpecialtyClick = (spec: string) => {
    navigate(`/search/results?specialty=${encodeURIComponent(spec)}`);
  };

  return (
    <Box>
      {/* ---------- Hero ---------- */}
      <Box
        sx={{
          mt: { xs: -2, sm: -3 },
          pt: { xs: 6, md: 10 },
          pb: { xs: 8, md: 12 },
          width: '100%',
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 45%, #9c27b0 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            top: -60,
            right: -100,
            animation: `${float} 6s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            bottom: -40,
            left: '8%',
            animation: `${float} 8s ease-in-out infinite`,
            animationDelay: '2s',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)',
            top: '25%',
            left: '3%',
            animation: `${float} 5s ease-in-out infinite`,
            animationDelay: '1s',
          }}
        />

        <Container maxWidth="md">
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ alignItems: 'center' }}>
            <Box sx={{ flex: 1, animation: `${fadeInUp} 0.8s ease-out` }}>
              <Typography
                variant="h2"
                color="white"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { xs: '2rem', md: '3rem' },
                  lineHeight: 1.15,
                }}
              >
                Your Health,
                <br />
                Our Priority
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: 'rgba(255,255,255,0.85)', mb: 4, fontWeight: 400, maxWidth: 480 }}
              >
                Find the right doctor and book appointments instantly. Quality healthcare made
                simple.
              </Typography>

              <Box
                sx={{
                  animation: `${fadeInUp} 0.8s ease-out 0.2s both`,
                  background: 'white',
                  borderRadius: 3,
                  p: { xs: 1.5, sm: 2 },
                  width: '100%',
                  maxWidth: 760,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                }}
              >
                <Stack spacing={1.5} sx={{ width: '100%' }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: '100%' }}>
                    <TextField
                      placeholder="Doctor name..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch();
                      }}
                      size="medium"
                      fullWidth
                      sx={{
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { border: 'none' },
                        },
                      }}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon color="action" />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleSearch}
                      size="large"
                      sx={{
                        minWidth: { sm: 150 },
                        px: 3,
                        background: 'linear-gradient(135deg, #1976d2, #9c27b0)',
                        fontWeight: 600,
                        '&:hover': { background: 'linear-gradient(135deg, #1565c0, #7b1fa2)' },
                      }}
                    >
                      Find Doctor
                    </Button>
                  </Stack>

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', mb: 0.75, display: 'block', fontWeight: 600 }}
                    >
                      Specialty
                    </Typography>
                    <TextField
                      select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      size="medium"
                      fullWidth
                      slotProps={{
                        select: {
                          displayEmpty: true,
                          renderValue: (selected: unknown) =>
                            (selected as string) ? (selected as string) : 'All specialties',
                        },
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { border: 'none' },
                        },
                      }}
                    >
                      <MenuItem value="">All specialties</MenuItem>
                      {specialties.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Stack>
              </Box>
            </Box>

            <Box sx={{ flexShrink: 0, display: { xs: 'none', md: 'block' }, width: { md: '42%' } }}>
              <Box
                component="img"
                src={heroImage}
                alt="Medical professionals"
                sx={{
                  width: '100%',
                  maxWidth: 460,
                  animation: `${float} 4s ease-in-out infinite`,
                  filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.15))',
                }}
              />
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* ---------- Stats ---------- */}
      <Box ref={statsRef} sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              mx: -1.5,
            }}
          >
            {stats.map((stat) => (
              <Box key={stat.label} sx={{ width: { xs: '50%', md: '25%' }, px: 1.5, mb: 3 }}>
                <Card
                  sx={{
                    textAlign: 'center',
                    py: 3.5,
                    height: '100%',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                    borderRadius: 3,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 28px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Box sx={{ mb: 1 }}>{stat.icon}</Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                    {statsInView ? <AnimatedCounter end={stat.value} start={statsInView} /> : '0'}
                    {stat.suffix}+
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ---------- How It Works ---------- */}
      <Box ref={stepsRef} sx={{ py: { xs: 6, md: 8 }, bgcolor: '#f8faff' }}>
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ textAlign: 'center', mb: 1, fontWeight: 700 }}>
            How It Works
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: 'center', mb: 6, maxWidth: 460, mx: 'auto' }}
          >
            Book your doctor appointment in three simple steps
          </Typography>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 4, md: 6 }}
            sx={{ alignItems: 'flex-start' }}
          >
            {steps.map((step, i) => (
              <Box
                key={step.title}
                sx={{
                  flex: 1,
                  textAlign: 'center',
                  animation: stepsInView ? `${fadeInUp} 0.6s ease-out ${i * 0.2}s both` : 'none',
                }}
              >
                <Box
                  sx={{
                    width: 88,
                    height: 88,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1976d2, #9c27b0)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    mx: 'auto',
                    mb: 2.5,
                    boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
                  }}
                >
                  {step.icon}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  {step.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ maxWidth: 280, mx: 'auto' }}
                >
                  {step.desc}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ---------- Specialties ---------- */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ textAlign: 'center', mb: 1, fontWeight: 700 }}>
            Our Specialties
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: 'center', mb: 6, maxWidth: 460, mx: 'auto' }}
          >
            Expert care across a wide range of medical fields
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
            {specialties.map((spec) => (
              <Box
                key={spec}
                sx={{ width: { xs: '50%', sm: '33.33%', md: '25%' }, px: 1.5, mb: 3 }}
              >
                <Card
                  onClick={() => handleSpecialtyClick(spec)}
                  sx={{
                    cursor: 'pointer',
                    textAlign: 'center',
                    py: 3,
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                      '& .specialty-icon': {
                        transform: 'scale(1.12)',
                        color: 'primary.main',
                      },
                    },
                  }}
                >
                  <Box
                    className="specialty-icon"
                    sx={{ color: 'secondary.main', mb: 1.5, transition: 'all 0.3s' }}
                  >
                    {specialtyIcons[spec] || defaultSpecialtyIcon}
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {spec}
                  </Typography>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ---------- Why Choose Us ---------- */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#f8faff' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ textAlign: 'center', mb: 1, fontWeight: 700 }}>
            Why Choose Medica
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: 'center', mb: 6, maxWidth: 460, mx: 'auto' }}
          >
            We make healthcare accessible, reliable, and patient-centered
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
            {features.map((feat) => (
              <Box
                key={feat.title}
                sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, px: 1.5, mb: 3 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 28px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4, px: 3 }}>
                    <Box sx={{ color: 'primary.main', mb: 1.5 }}>{feat.icon}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {feat.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feat.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ---------- CTA ---------- */}
      <Box
        sx={{
          py: { xs: 7, md: 9 },
          textAlign: 'center',
          width: '100%',
          background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 250,
            height: 250,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            top: -80,
            right: -60,
            animation: `${float} 7s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            bottom: -50,
            left: '12%',
            animation: `${float} 6s ease-in-out infinite`,
            animationDelay: '1.5s',
          }}
        />

        <Container maxWidth="sm">
          <Typography
            variant="h3"
            color="white"
            sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1.8rem', md: '2.5rem' } }}
          >
            Ready to take control of your health?
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', mb: 4 }}>
            Join thousands of patients who trust Medica for their healthcare needs. Sign up today
            and book your first appointment.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{
              px: 6,
              py: 1.6,
              fontSize: '1.1rem',
              fontWeight: 700,
              bgcolor: 'white',
              color: 'primary.main',
              borderRadius: 3,
              animation: `${pulse} 2s infinite`,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)',
                animation: 'none',
              },
            }}
          >
            Get Started Free
          </Button>
        </Container>
      </Box>
    </Box>
  );
}

export default HomePage;
