import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminLogin from "../pages/AdminLogin";
import AdminLayout from "../components/admin/AdminLayout";
import ProviderTours from "../components/admin/ProviderTours";
import TourPricesManagement from "../components/admin/ProviderTourPrice";
import TourDetails from "../components/admin/ProviderTourDetail";
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
    path: "/admin/tours/schedules", 
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Tour Schedules">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Quản Lý Lịch Trình Tours</h1>
            <p className="text-muted-foreground">Quản lý lịch trình và thời gian biểu của tours.</p>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 text-sm">
                📅 API endpoint: GET /api/provider/tour-schedules
              </p>
            </div>
          </div>
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/tours/images",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Tour Images">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Quản Lý Hình Ảnh Tours</h1>
            <p className="text-muted-foreground">Quản lý thư viện hình ảnh của tours.</p>
            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <p className="text-purple-800 text-sm">
                🖼️ API endpoint: GET /api/provider/tour-images
              </p>
            </div>
          </div>
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
