import ClientLayout from '../layouts/ClientLayout';
import Home from '../pages/Home';
import TourDetail from '../pages/TourDetail';
import Booking from '../pages/Booking';
import Pricing from '../pages/Pricing';
import TourCategory from '../pages/TourCategory';
import About from '../pages/About';
import ForgotPassword from '../pages/ForgotPassword';
import EnterOtp from '../pages/EnterOtp';
import LoginSuccess from '../pages/LoginSuccess';
import Profile from '../pages/Profile';
import BlogDetail from '../pages/BlogDetail';
import MyBooking from '../pages/MyBooking';
import { ProtectedRoute } from '@/components/authentication/ProtectedRoute';

export const clientRoutes = [
  { path: '', element: <Home /> },
  {
    path: '/',
    element: <ClientLayout />,
    children: [
      { path: 'tour/:slug', element: <TourDetail /> },
      {
        path: 'booking/:slug',
        element: (
          <ProtectedRoute>
            <Booking />
          </ProtectedRoute>
        )
      },
      { path: 'pricing', element: <Pricing /> },
      { path: 'tour-category/:slug', element: <TourCategory /> },
      { path: 'about', element: <About /> },
      { path: 'blog/:id', element: <BlogDetail /> },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )
      },
      {
        path: 'my-booking',
        element: (
          <ProtectedRoute>
            <MyBooking />
          </ProtectedRoute>)
      }
    ]
  },
  { path: 'reset-password', element: <ForgotPassword /> },
  { path: 'verify/email', element: <EnterOtp /> },
  { path: 'login/success', element: <LoginSuccess /> },
];
