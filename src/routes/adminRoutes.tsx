import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminLogin from "../pages/AdminLogin";
import AdminLayout from "../components/admin/AdminLayout";
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
          {/* <AdminTours /> - Create this component later */}
          <div className="p-6">
            <h1 className="text-2xl font-bold">Tours Management</h1>
            <p className="text-muted-foreground">Manage all tours here.</p>
          </div>
        </AdminLayout>
      </RequireAdminAccess>
    ),
  },
  {
    path: "/admin/tours/new",
    element: (
      <RequireAdminAccess>
        <AdminLayout title="Add New Tour">
          {/* <AddTourForm /> - Create this component later */}
          <div className="p-6">
            <h1 className="text-2xl font-bold">Add New Tour</h1>
            <p className="text-muted-foreground">Create a new tour package.</p>
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
          {/* <AdminUsers /> - Create this component later */}
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
          {/* <AdminBookings /> - Create this component later */}
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
          {/* <AdminSettings /> - Create this component later */}
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
