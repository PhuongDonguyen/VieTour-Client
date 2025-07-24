import ClientLayout from '../layouts/ClientLayout';
import Home from '../pages/Home';
import TourDetail from '../pages/TourDetail';
import Pricing from '../pages/Pricing';
import TourCategory from '../pages/TourCategory';
import About from '../pages/About';
import ForgotPassword from '../pages/ForgotPassword';
import EnterOtp from '../pages/EnterOtp';
import LoginSuccess from '../pages/LoginSuccess';
import Profile from '../pages/Profile';
import BlogDetail from '../pages/BlogDetail';

export const clientRoutes = [
  { path: '', element: <Home /> },
  {
    path: '/',
    element: <ClientLayout />,
    children: [
      { path: 'tour/:slug', element: <TourDetail /> },
      { path: 'pricing', element: <Pricing /> },
      { path: 'tour-category/:slug', element: <TourCategory /> },
      { path: 'about', element: <About /> },
      { path: 'blog/:id', element: <BlogDetail /> },
      { path: 'profile', element: <Profile /> }
    ]
  },
  { path: 'reset-password', element: <ForgotPassword /> },
  { path: 'verify/email', element: <EnterOtp /> },
  { path: 'login/success', element: <LoginSuccess /> },
];
