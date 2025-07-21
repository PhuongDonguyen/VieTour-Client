import React from "react";

// Placeholder for shadcn UI components. Replace with actual imports if you have shadcn/ui installed.
// import { Sidebar, Header, Card, Button } from "@/components/ui";

const AdminDashboard: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:block">
        <div className="h-16 flex items-center justify-center font-bold text-xl border-b">
          Admin
        </div>
        <nav className="p-4 space-y-2">
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-200">Dashboard</a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-200">Users</a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-200">Settings</a>
        </nav>
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center px-6 justify-between">
          <div className="font-semibold text-lg">Dashboard</div>
          <div>
            {/* Placeholder for user/account menu */}
            <button className="px-4 py-2 bg-gray-200 rounded">Account</button>
          </div>
        </header>
        {/* Content */}
        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Example cards */}
            <div className="bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-500">Users</div>
              <div className="text-2xl font-bold">1,234</div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-500">Revenue</div>
              <div className="text-2xl font-bold">$12,345</div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-500">Orders</div>
              <div className="text-2xl font-bold">567</div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-500">Visits</div>
              <div className="text-2xl font-bold">8,910</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Overview</h2>
            <p>This is your admin dashboard. Add charts, tables, and more here.</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 