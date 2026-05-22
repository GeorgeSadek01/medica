import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store';
import { selectUser } from '../store/authSlice';
import GuestLayout from './GuestLayout';
import MainLayout from './MainLayout';

function RootLayout() {
  const user = useAppSelector(selectUser);
  const location = useLocation();

  if (user?.role === 'doctor' && !location.pathname.startsWith('/doctor')) {
    return <Navigate to="/doctor/dashboard" replace />;
  }
  if (user?.role === 'admin' && !location.pathname.startsWith('/admin')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user) {
    return (
      <MainLayout>
        <Outlet />
      </MainLayout>
    );
  }

  return <GuestLayout><Outlet /></GuestLayout>;
}

export default RootLayout;
