import Home from '../pages/Home';
import TourDetail from '../pages/TourDetail';
import BlogDetail from '../pages/BlogDetail';
import Pricing from '../pages/Pricing';
import About from '../pages/About';
import TourCategory from '../pages/TourCategory';
import PaymentSuccess from '../pages/PaymentSuccess';
import PaymentFailed from '../pages/PaymentFailed';
import BlogCategory from '../pages/BlogCategory';
import Gallery from "../pages/TourImageGallery";
import path from "path";
import TourImageGallery from "../pages/TourImageGallery";
import CancellationRequests from "../pages/admin/AdminCancellationRequests";
import ProviderBookings from "../pages/provider/ProviderBookings";

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
    path: '/blog/:slug',
    element: <BlogDetail />,
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
    path: '/about',
    element: <About />,
  },
  {
    path: '/blog/:slug',
    element: <BlogDetail />,
  },
  {
    path: '/payment/success',
    element: <PaymentSuccess />,
  },
  {
    path: '/payment/failed',
    element: <PaymentFailed />,
  },
  {
    path: '/gallery',
    element: <TourImageGallery />,
  },
];
