import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import RoleRoute from '../components/RoleRoute';
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
import AdminDashboard from '../pages/AdminDashboard';
import AdminUsers from '../pages/AdminUsers';
import AdminAppointments from '../pages/AdminAppointments';
import AdminSpecialties from '../pages/AdminSpecialties';

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

          {
            path: 'doctor',
            element: <RoleRoute roles={['doctor']} />,
            children: [
              { path: 'dashboard', element: <DoctorDashboardPage /> },
              { path: 'appointments', element: <DoctorAppointmentsPage /> },
              { path: 'availability', element: <DoctorAvailabilityPage /> },
            ],
          },

          {
            path: 'admin',
            element: <RoleRoute roles={['admin']} />,
            children: [
              { path: 'dashboard', element: <AdminDashboard /> },
              { path: 'users', element: <AdminUsers /> },
              { path: 'appointments', element: <AdminAppointments /> },
              { path: 'specialties', element: <AdminSpecialties /> },
            ],
          },
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
