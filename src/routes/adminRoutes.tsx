import AdminDashboard from "../components/admin/AdminDashboard";
import RequireAdminAuth from "../components/admin/RequireAdminAuth";
import AdminLogin from "../pages/AdminLogin";
// Admin routes - you can add admin-specific components here
export const adminRoutes = [
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/admin",
    element: (
      <RequireAdminAuth>
        <AdminDashboard />
      </RequireAdminAuth>
    ),
  },
];
