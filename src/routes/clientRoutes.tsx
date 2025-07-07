import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';

export const clientRoutes = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
];
