import Home from '../pages/Home';
import TourDetail from '../pages/TourDetail';
import Login from '../pages/Login';
import Signup from '../pages/Signup';

export const clientRoutes = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/tour/:slug',
    element: <TourDetail />,
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
];
