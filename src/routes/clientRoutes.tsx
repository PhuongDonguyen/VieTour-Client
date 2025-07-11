import Home from '../pages/Home';
import TourDetail from '../pages/TourDetail';
import Pricing from '../pages/Pricing';
import TourCategory from '../pages/TourCategory';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import About from '../pages/About';

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
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/about',
    element: <About />,
  },
];
