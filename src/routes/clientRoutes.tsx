import Home from '../pages/Home';
import Pricing from '../pages/Pricing';
import TourCategory from '../pages/TourCategory';

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
  }
];
