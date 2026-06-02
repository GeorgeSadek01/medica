import { useLocation, useNavigate, Link } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { useAppSelector } from '../../store';
import { selectUser } from '../../store/authSlice';

const DRAWER_WIDTH = 240;

const patientLinks = [
  { label: 'Dashboard',    path: '/dashboard/patient',  icon: <DashboardIcon /> },
  { label: 'Find Doctors', path: '/find-doctor',        icon: <LocalHospitalIcon /> },
  { label: 'Appointments', path: '/appointments/patient', icon: <CalendarMonthIcon /> },
  { label: 'My Profile',   path: '/profile/patient',    icon: <PersonIcon /> },
];

const doctorLinks = [
  { label: 'Dashboard',    path: '/doctor/dashboard',    icon: <DashboardIcon /> },
  { label: 'Appointments', path: '/doctor/appointments', icon: <CalendarMonthIcon /> },
  { label: 'Availability', path: '/doctor/availability', icon: <EventAvailableIcon /> },
  { label: 'My Profile',   path: '/doctor/profile',      icon: <PersonIcon /> },
];

const adminLinks = [
  { label: 'Dashboard',    path: '/admin/dashboard',    icon: <DashboardIcon /> },
  { label: 'Users',        path: '/admin/users',        icon: <PeopleIcon /> },
  { label: 'Verifications', path: '/admin/verifications', icon: <VerifiedUserIcon /> },
  { label: 'Appointments', path: '/admin/appointments', icon: <CalendarMonthIcon /> },
  { label: 'Specialties',  path: '/admin/specialties',  icon: <MedicalServicesIcon /> },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant?: 'permanent' | 'temporary';
}

const Sidebar = ({ open, onClose, variant = 'temporary' }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector(selectUser);

  const role = user?.role as string;

  const links =
    role === 'admin'
      ? adminLinks
      : role === 'doctor'
      ? doctorLinks
      : patientLinks;

  const handleNavigate = (path: string) => {
    navigate(path);
    if (variant === 'temporary') onClose();
  };

  const drawerContent = (
    <Box sx={{ width: DRAWER_WIDTH }}>
      <Box sx={{ px: 2, py: 2.5 }}>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            fontWeight: 800,
            cursor: 'pointer',
            letterSpacing: '-0.5px',
            transition: 'all 0.2s ease',
            textDecoration: 'none',
            color: 'primary.main',
            '&:hover': { opacity: 0.8, transform: 'scale(1.03)' },
          }}
        >
          Medica
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user?.role
            ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
            : ''}{' '}
          Panel
        </Typography>
      </Box>

      <Divider />

      <List sx={{ px: 1, pt: 1 }}>
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <ListItem key={link.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigate(link.path)}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '& .MuiListItemIcon-root': { color: 'white' },
                    '&:hover': { bgcolor: 'primary.dark' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{link.icon}</ListItemIcon>
                <ListItemText
                  primary={link.label}
                  slotProps={{ primary: { sx: { fontSize: 14 } } }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: variant === 'permanent' ? DRAWER_WIDTH : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          top: '64px',
          height: 'calc(100vh - 64px)',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;