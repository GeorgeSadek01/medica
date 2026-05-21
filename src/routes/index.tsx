import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DoctorProfilePage from '../pages/DoctorProfilePage';
import DoctorDashboardPage from '../pages/DoctorDashboardPage';
import DoctorAppointmentsPage from '../pages/DoctorAppointmentsPage';
import DoctorAvailabilityPage from '../pages/DoctorAvailabilityPage';
const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthLayout />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: '/register',
    element: <AuthLayout />,
    children: [{ index: true, element: <RegisterPage /> }],
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'doctor/profile', element: <DoctorProfilePage /> },
          { path: 'doctor/dashboard', element: <DoctorDashboardPage /> },
          { path: 'doctor/appointments', element: <DoctorAppointmentsPage /> },
          { path: 'doctor/availability', element: <DoctorAvailabilityPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;
