import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store';
import { selectUser } from '../store/authSlice';

interface RoleRouteProps {
  roles: string[];
}

function RoleRoute({ roles }: RoleRouteProps) {
  const user = useAppSelector(selectUser);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    if (user.role === 'doctor') {
      return <Navigate to="/doctor/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default RoleRoute;
