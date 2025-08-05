import React from "react";
import DashboardStats from "../../components/admin/DashboardStats";
import OverviewCard from "../../components/admin/OverviewCard";
import RevenueChart from "../../components/admin/RevenueChart";

const AdminDashboard: React.FC = () => {
  return (
    <>
      {/* Stats Grid */}
      <DashboardStats className="mb-6" />

      {/* Revenue Chart */}
      <RevenueChart className="mb-6" />

      {/* Overview Section */}
      <OverviewCard title="Dashboard Overview">
        <div className="space-y-4">
          <p>Welcome to your admin dashboard. Here you can:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Monitor user activity and engagement</li>
            <li>Track revenue and booking statistics</li>
            <li>Manage tours and travel packages</li>
            <li>View system analytics and reports</li>
          </ul>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm">
              💡 <strong>Tip:</strong> Use the sidebar navigation to access different sections of the admin panel.
            </p>
          </div>
        </div>
      </OverviewCard>
    </>
  );
};

export default AdminDashboard; 