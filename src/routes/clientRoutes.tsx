import Home from '../pages/Home';
import ForgotPassword from '../pages/ForgotPassword';
import EnterOtp from '../pages/EnterOtp';
import LoginSuccess from '../components/LoginSuccess';

export const clientRoutes = [
  {
    path: '/',
    element: <Home />,
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
  }
];
