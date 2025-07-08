import Home from '../pages/Home';
import Pricing from '../pages/Pricing';
import TourCategory from '../pages/TourCategory';
import Login from '../pages/Login';
import Signup from '../pages/Signup';

export const clientRoutes = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/pricing',
    element: <Pricing />,
  },
  {
    path: '/tours/:slug',
    element: <TourCategory />,
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
