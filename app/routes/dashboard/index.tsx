import { Navigate } from 'react-router';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useAppSelector } from '~/store/hooks';
import type { UserRole } from '~/lib/auth';

const roleDefaultPaths: Record<UserRole, string> = {
  patient: '/dashboard/patient',
  doctor: '/dashboard/doctor',
  admin: '/dashboard/admin',
};

export default function DashboardIndex() {
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const targetPath = roleDefaultPaths[user.role] || '/unauthorized';

  return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h5" gutterBottom>
        Redirecting to your dashboard...
      </Typography>
      <CircularProgress sx={{ mt: 2 }} />
      <Navigate to={targetPath} replace />
    </Box>
  );
}
