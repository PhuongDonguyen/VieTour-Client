import React, { useEffect } from "react";
import AdminBookingsTable from "../../components/admin/AdminBookingsTable";

const AdminBookings: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="p-6">
      <AdminBookingsTable />
    </div>
  );
};

export default AdminBookings;
