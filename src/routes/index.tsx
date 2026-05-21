import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import PatientDashboard from '../pages/PatientDashboard';
import PatientProfile from '../pages/PatientProfile';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DoctorProfilePage from '../pages/DoctorProfilePage';
import DoctorResults from '../pages/DoctorResults';
import DoctorProfile from '../pages/DoctorProfile';
import AppointmentDetails from '../pages/AppointmentDetails';
import PaymentPage from '../pages/PaymentPage';
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
          { path: 'dashboard/patient', element: <PatientDashboard /> },
          { path: 'search/results', element: <DoctorResults /> },
          { path: 'doctors/:id', element: <DoctorProfile /> },
          { path: 'profile/patient', element: <PatientProfile /> },
          { path: 'appointments/:id', element: <AppointmentDetails /> },
          { path: 'payment/:id', element: <PaymentPage /> },
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
