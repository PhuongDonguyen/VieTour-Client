import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminLogin from "../pages/AdminLogin";
import AdminLayout from "../components/admin/AdminLayout";
import ProviderTours from "../components/admin/Tours";
import TourPricesManagement from "../components/admin/TourPrice";
import TourDetails from "../components/admin/TourDetail";
import TourSchedulesManagement from "../components/admin/TourSchedule";
import TourImagesManagement from "../components/admin/TourImage";
import TourPriceOverridesManagement from "../components/admin/TourPriceOverride";
import TourCategory from "../components/admin/TourCategory";
import AdminBlog from "../pages/admin/AdminBlog";
import BlogEditor from "../pages/admin/BlogEditor";
import BlogCategories from "../pages/admin/BlogCategories";
import { RequireAdminAccess, RequireAdminOnly, RequireProviderOnly } from "../components/admin/AuthWrappers";
import AdminBlogCategories from "@/pages/admin/AdminBlogCategories";

// Admin routes - AdminLayout wraps all authenticated admin pages
export const adminRoutes = [
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/admin",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Dashboard">
          <AdminDashboard />
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/dashboard",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Dashboard">
          <AdminDashboard />
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  // Example of how to add more admin pages with different titles
  // shadcn
  {
    path: "/admin/tours",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Tours Management">
          <ProviderTours />
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/tours/new",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Add New Tour">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Thêm Tour Mới</h1>
            <p className="text-muted-foreground">Tạo gói tour du lịch mới.</p>
          </div>
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/tours/prices",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Tour Prices">
          <TourPricesManagement />
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/tours/price-overrides",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Tour Price Overrides">
          <TourPriceOverridesManagement />
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/tours/schedules",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Tour Schedules">
          <TourSchedulesManagement />
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/tours/images",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Tour Images">
          <TourImagesManagement />
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/tours/details",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Tour Details">
          <TourDetails />
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/tours/categories",
    element: (
      <RequireAdminOnly>
        <AdminLayout title="Tour Categories">
          <TourCategory />
        </AdminLayout>
      </RequireAdminOnly>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <RequireAdminOnly>
        <AdminLayout title="User Management">
          <div className="p-6">
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage users and permissions.</p>
          </div>
        </AdminLayout>
      </RequireAdminOnly>
    ),
  },
  {
    path: "/admin/bookings",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Bookings">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Bookings Management</h1>
            <p className="text-muted-foreground">View and manage all bookings.</p>
          </div>
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  // Blog routes
  {
    path: "/admin/blog",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Blog Management">
          <AdminBlog />
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/blog/new",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Create Blog Post">
          <BlogEditor />
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/blog/edit/:id",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Edit Blog Post">
          <BlogEditor />
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/blog/categories",
    element: (
      <RequireAdminOnly>
        <AdminLayout title="Blog Categories">
          <BlogCategories />
        </AdminLayout>
      </RequireAdminOnly>
    ),
  },
  {
    path: "/admin/settings",
    element: (
      <RequireAdminOnly>
        <AdminLayout title="Settings">
          <div className="p-6">
            <h1 className="text-2xl font-bold">System Settings</h1>
            <p className="text-muted-foreground">Configure system settings.</p>
          </div>
        </AdminLayout>
      </RequireAdminOnly>
    ),
  },
  // Provider-only routes
  {
    path: "/admin/my-tours",
    element: (
      <RequireProviderOnly>
        <AdminLayout title="My Tours">
          <div className="p-6">
            <h1 className="text-2xl font-bold">My Tour Packages</h1>
            <p className="text-muted-foreground">Manage your own tour packages and itineraries.</p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-sm">
                📦 View and edit tours created by your company
              </p>
            </div>
          </div>
        </AdminLayout>
      </RequireProviderOnly>
    ),
  },
  {
    path: "/admin/my-bookings",
    element: (
      <RequireProviderOnly>
        <AdminLayout title="My Bookings">
          <div className="p-6">
            <h1 className="text-2xl font-bold">My Tour Bookings</h1>
            <p className="text-muted-foreground">View bookings for your tour packages.</p>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 text-sm">
                📅 Track customer bookings for your tours only
              </p>
            </div>
          </div>
        </AdminLayout>
      </RequireProviderOnly>
    ),
  },
  {
    path: "/admin/earnings",
    element: (
      <RequireProviderOnly>
        <AdminLayout title="Earnings & Analytics">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Earnings Dashboard</h1>
            <p className="text-muted-foreground">Track your revenue and payment analytics.</p>
            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <p className="text-purple-800 text-sm">
                💰 View earnings, commission rates, and payout schedules
              </p>
            </div>
          </div>
        </AdminLayout>
      </RequireProviderOnly>
    ),
  },
  {
    path: "/admin/profile",
    element: (
      <RequireProviderOnly>
        <AdminLayout title="Company Profile">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Company Profile</h1>
            <p className="text-muted-foreground">Manage your company information and business details.</p>
            <div className="mt-4 p-4 bg-amber-50 rounded-lg">
              <p className="text-amber-800 text-sm">
                🏢 Update company details, contact info, and business verification
              </p>
            </div>
          </div>
        </AdminLayout>
      </RequireProviderOnly>
    ),
  },
];
