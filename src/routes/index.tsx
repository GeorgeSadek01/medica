import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import GuestRoute from '../components/GuestRoute';
import RoleRoute from '../components/RoleRoute';
import PatientDashboard from '../pages/PatientDashboard';
import PatientAppointments from '../pages/PatientAppointments';
import PatientProfile from '../pages/PatientProfile';
import HomePage from '../pages/HomePage';
import FindDoctor from '../pages/FindDoctor';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import EmailVerificationPage from '../pages/EmailVerificationPage';
import DoctorProfilePage from '../pages/DoctorProfilePage';

import DoctorProfile from '../pages/DoctorProfile';
import AppointmentDetails from '../pages/AppointmentDetails';
import PaymentPage from '../pages/PaymentPage';
import DoctorDashboardPage from '../pages/DoctorDashboardPage';
import DoctorAppointmentsPage from '../pages/DoctorAppointmentsPage';
import DoctorAvailabilityPage from '../pages/DoctorAvailabilityPage';
import AdminDashboard from '../pages/AdminDashboard';
import AdminUsers from '../pages/AdminUsers';
import AdminUserDetail from '../pages/AdminUserDetail';
import AdminAppointments from '../pages/AdminAppointments';
import AdminSpecialties from '../pages/AdminSpecialties';
import AdminVerifications from '../pages/AdminVerifications';

const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
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
        path: '/forgot-password',
        element: <AuthLayout />,
        children: [{ index: true, element: <ForgotPasswordPage /> }],
      },
      {
        path: '/reset-password',
        element: <AuthLayout />,
        children: [{ index: true, element: <ResetPasswordPage /> }],
      },
      {
        path: '/verify-email',
        element: <AuthLayout />,
        children: [{ index: true, element: <EmailVerificationPage /> }],
      },
    ],
  },
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'find-doctor', element: <FindDoctor /> },

      { path: 'doctors/:id', element: <DoctorProfile /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'doctor/profile', element: <DoctorProfilePage /> },
          { path: 'dashboard/patient', element: <PatientDashboard /> },
          { path: 'appointments/patient', element: <PatientAppointments /> },
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
              { path: 'users/:id', element: <AdminUserDetail /> },
              { path: 'appointments', element: <AdminAppointments /> },
              { path: 'specialties', element: <AdminSpecialties /> },
              { path: 'verifications', element: <AdminVerifications /> },
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
