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
import PaymentSuccess from '../pages/PaymentSuccess';
import PaymentFailed from '../pages/PaymentFailed';
import CancelBooking from '../pages/CancelBooking';
import { ProtectedRoute } from '@/components/authentication/ProtectedRoute';
import AccountPage from "@/pages/AccountPage";

export const clientRoutes = [
  {
    path: "/",
    element: <ClientLayout />,
    children: [
      { path: '', element: <Home /> },
      { path: 'tour/:slug', element: <TourDetail /> },
      {
        path: 'booking/:slug',
        element: <Booking />
      },
      { path: 'pricing', element: <Pricing /> },
      { path: 'tour-category/:slug', element: <TourCategory /> },
      { path: 'about', element: <About /> },
      { path: 'blog/:id', element: <BlogDetail /> },
      { path: 'payment/success', element: <PaymentSuccess /> },
      { path: 'payment/failed', element: <PaymentFailed /> },
      {
        path: 'cancel-booking/:bookingId',
        element: (
          <ProtectedRoute>
            <CancelBooking />
          </ProtectedRoute>
        )
      },
      {
        path: 'user/:active',
        element: (
          // <ProtectedRoute>
            <AccountPage />
          // {/* </ProtectedRoute> */}
        )
      },
      { path: ":active", element: <AccountPage /> }
    ]
  },
  { path: "reset-password", element: <ForgotPassword /> },
  { path: "verify/email", element: <EnterOtp /> },
  { path: "login/success", element: <LoginSuccess /> },
];
