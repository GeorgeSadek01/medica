import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAppSelector } from '../store';
import { selectAuth } from '../store/authSlice';

function GuestRoute() {
  const { user, initialized } = useAppSelector(selectAuth);

  if (!initialized) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default GuestRoute;
