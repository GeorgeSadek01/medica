import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import PatientDashboard from '../pages/PatientDashboard';
<<<<<<< HEAD
=======
import PatientProfile from '../pages/PatientProfile';
>>>>>>> 2b2ec0a (feat: add patient profile page with edit and image upload, improve appointment availability management)
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DoctorResults from '../pages/DoctorResults';
import DoctorProfile from '../pages/DoctorProfile';
import AppointmentDetails from '../pages/AppointmentDetails';
import PaymentPage from '../pages/PaymentPage';

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
          { path: 'dashboard/patient', element: <PatientDashboard /> },
          { path: 'search/results', element: <DoctorResults /> },
          { path: 'doctors/:id', element: <DoctorProfile /> },
<<<<<<< HEAD
=======
          { path: 'profile/patient', element: <PatientProfile /> },
>>>>>>> 2b2ec0a (feat: add patient profile page with edit and image upload, improve appointment availability management)
          { path: 'appointments/:id', element: <AppointmentDetails /> },
          { path: 'payment/:id', element: <PaymentPage /> },
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
