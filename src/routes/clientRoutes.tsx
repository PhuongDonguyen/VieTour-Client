import Home from '../pages/Home';
import TourDetail from '../pages/TourDetail';
import Pricing from '../pages/Pricing';
import TourCategory from '../pages/TourCategory';
import About from '../pages/About';
import ForgotPassword from '../pages/ForgotPassword';
import EnterOtp from '../pages/EnterOtp';
import LoginSuccess from '../components/LoginSuccess';

export const clientRoutes = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/tour/:slug',
    element: <TourDetail />,
  },
  {
    path: '/pricing',
    element: <Pricing />,
  },
  {
    path: '/tour-category/:slug',
    element: <TourCategory />,
  },
  {
    path: '/tour/:slug',
    element: <TourDetail />,
  },
  {
    path: '/pricing',
    element: <Pricing />,
  },
  {
    path: '/tour-category/:slug',
    element: <TourCategory />,
  },
  {
    path: '/reset-password',
    element: <ForgotPassword />,
  },
  {
    path: '/verify/email',
    element: <EnterOtp />,
  },
  {
    path: '/login/success',
    element: <LoginSuccess />
  },
  {
    path: '/about',
    element: <About />,
  },
];
