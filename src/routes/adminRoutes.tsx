import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminLogin from "../pages/AdminLogin";
import AdminLayout from "../components/admin/AdminLayout";
import ProviderTours from "../components/admin/Tours";
import TourPricesManagement from "../components/admin/TourPrice";
import TourDetails from "../components/admin/TourDetail";
import TourSchedulesManagement from "../components/admin/TourSchedule";
import TourImagesManagement from "../components/admin/TourImage";
import TourPriceOverridesManagement from "../components/admin/TourPriceOverride";
import { RequireAdminAccess, RequireAdminOnly, RequireProviderOnly } from "../components/admin/AuthWrappers";

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
          <div className="p-6">
            <h1 className="text-2xl font-bold">Quản Lý Danh Mục Tours</h1>
            <p className="text-muted-foreground">Quản lý các danh mục và phân loại tours.</p>
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <p className="text-red-800 text-sm">
                🏷️ API endpoint: GET /api/provider/tour-categories
              </p>
            </div>
          </div>
        </AdminLayout>
      </RequireAdminOnly>
    ),
  },
  {
    path: "/admin/tours/price-overrides",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Price Overrides">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Quản Lý Giá Đặc Biệt</h1>
            <p className="text-muted-foreground">Quản lý giá đặc biệt và các ưu đãi theo mùa.</p>
            <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
              <p className="text-indigo-800 text-sm">
                💲 API endpoint: GET /api/provider/tour-price-overrides
              </p>
            </div>
          </div>
        </AdminLayout>
      </RequireAdminAccess>
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
          <div className="p-6">
            <h1 className="text-2xl font-bold">Blog Posts</h1>
            <p className="text-muted-foreground">Manage all blog posts and articles.</p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-sm">
                📝 Create and manage engaging content for your travel blog
              </p>
            </div>
          </div>
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/blog/new",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Create Blog Post">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Create New Blog Post</h1>
            <p className="text-muted-foreground">Write and publish a new travel article.</p>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 text-sm">
                ✍️ Share travel tips, destination guides, and inspiring stories
              </p>
            </div>
          </div>
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/blog/categories",
    element: (
      <RequireAdminOnly>
        <AdminLayout title="Blog Categories">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Blog Categories</h1>
            <p className="text-muted-foreground">Organize blog posts with categories and tags.</p>
            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <p className="text-purple-800 text-sm">
                🏷️ Create categories like "Travel Tips", "Destinations", "Food & Culture"
              </p>
            </div>
          </div>
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
