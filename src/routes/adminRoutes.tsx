import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminLogin from "../pages/AdminLogin";
import AdminLayout from "../components/admin/AdminLayout";
import ProviderTours from "../components/admin/tour/Tours";
import TourEditor from "../components/admin/tour/TourEditor";
import TourView from "../pages/admin/TourView";
import TourDetailView from "../pages/admin/TourDetailView";
import TourDetailEditor from "../components/admin/tour-detail/TourDetailEditor";
import TourPriceView from "../pages/admin/TourPriceView";
import TourPriceEditor from "../components/admin/tour-price/TourPriceEditor";
import TourScheduleView from "../pages/admin/TourScheduleView";
import TourScheduleEditor from "../components/admin/tour-schedule/TourScheduleEditor";
import TourPricesManagement from "../components/admin/tour-price/TourPrice";
import TourDetails from "../components/admin/tour-detail/TourDetail";
import TourSchedulesManagement from "../components/admin/tour-schedule/TourSchedule";
import TourSchedulesListPage from "../pages/admin/TourSchedulesListPage";
import TourImagesManagement from "../components/admin/tour-image/TourImage";
import TourPriceOverridesListPage from "../pages/admin/TourPriceOverridesListPage";
import TourCategory from "../components/admin/tour-category/TourCategory";
import AdminBlog from "../pages/admin/AdminBlog";
import BlogEditor from "../pages/admin/BlogEditor";
import BlogCategories from "../pages/admin/BlogCategories";
import CancellationRequests from "../pages/admin/AdminCancellationRequests";
import AdminBookings from "../pages/admin/AdminBookings";

import {
  RequireAdminAccess,
  RequireAdminOnly,
  RequireProviderOnly,
} from "../components/admin/AuthWrappers";
import TourImageViewContent from "../components/admin/tour-image/TourImageViewContent";
import TourImageEditor from "../components/admin/tour-image/TourImageEditor";
import TourImageView from "../pages/admin/TourImageView";
import AdminBlogCategories from "@/pages/admin/AdminBlogCategories";
import AdminSupport from "@/pages/admin/AdminSupport";
import { ProviderRevenueStats } from "@/components/ProviderRevenueStats";
import { ProviderRevenueStatsWrapper } from "@/components/ProviderRevenueStatsWrapper";

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
        <AdminLayout title="Create New Tour">
          <TourEditor />
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/tours/edit/:id",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Edit Tour">
          <TourEditor />
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/tours/view/:id",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Tour Details">
          <TourView />
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
    path: "/admin/tours/prices/new",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Create New Tour Price">
          <TourPriceEditor />
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/tours/prices/edit/:id",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Edit Tour Price">
          <TourPriceEditor />
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/tours/prices/view/:id",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Tour Price View">
          <TourPriceView />
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/tours/price-overrides",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Tour Price Overrides">
          <TourPriceOverridesListPage />
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/tours/schedules",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Tour Schedules">
          <TourSchedulesListPage />
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/tours/schedules/view/:id",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Tour Schedule View">
          <TourScheduleView />
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/tours/schedules/edit/:id",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Edit Tour Schedule">
          <TourScheduleEditor />
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/tours/schedules/new",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Create New Tour Schedule">
          <TourScheduleEditor />
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
    path: "/admin/tours/images/view/:id",
    element: <TourImageViewContent />,
  },
  {
    path: "/admin/tours/images/new",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Create Tour Image">
          <TourImageEditor mode="create" />
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/tours/images/edit/:id",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Edit Tour Image">
          <TourImageEditor mode="edit" />
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/tours/images/view/:id",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Tour Image Details">
          <TourImageView />
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
    path: "/admin/tours/details/new",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Create New Tour Detail">
          <TourDetailEditor />
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/tours/details/edit/:id",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Edit Tour Detail">
          <TourDetailEditor />
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/tours/details/view/:id",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Tour Detail View">
          <TourDetailView />
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
            <p className="text-muted-foreground">
              Manage users and permissions.
            </p>
          </div>
        </AdminLayout>
      </RequireAdminOnly>
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
            <p className="text-muted-foreground">
              Manage your own tour packages and itineraries.
            </p>
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
            <p className="text-muted-foreground">
              View bookings for your tour packages.
            </p>
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
        <AdminLayout title="Thống kê doanh thu">
          <div className="p-6">
            <ProviderRevenueStatsWrapper/>
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
            <p className="text-muted-foreground">
              Manage your company information and business details.
            </p>
            <div className="mt-4 p-4 bg-amber-50 rounded-lg">
              <p className="text-amber-800 text-sm">
                🏢 Update company details, contact info, and business
                verification
              </p>
            </div>
          </div>
        </AdminLayout>
      </RequireProviderOnly>
    ),
  },
  {
    path: "/admin/cancellation-requests",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Yêu cầu hoàn tiền">
          <CancellationRequests />
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/bookings",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Quản lý đặt tour">
          <AdminBookings />
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/provider-bookings",
    element: (
      <RequireProviderOnly>
        <AdminLayout title="Đặt tour của tôi">
          <div className="p-6">
            <AdminBookings />
          </div>
        </AdminLayout>
      </RequireProviderOnly>
    ),
  },
  {
    path: "/admin/questions",
    element: (
      <RequireProviderOnly>
        <AdminLayout title="Câu hỏi của tôi">
          <div className="p-6">
            <AdminSupport />
          </div>
        </AdminLayout>
      </RequireProviderOnly>
    ),
  },
  
];
