import Home from '../pages/Home';
import TourDetail from '../pages/TourDetail';

export const clientRoutes = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/tour/:slug',
    element: <TourDetail />,
  },
];
