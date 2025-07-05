import { createBrowserRouter } from 'react-router-dom';
import { adminRoutes } from './adminRoutes';
import { clientRoutes } from './clientRoutes';

// Combine all routes
const allRoutes = [
  ...clientRoutes,
  ...adminRoutes,
];

// Create the router
export const router = createBrowserRouter(allRoutes);
