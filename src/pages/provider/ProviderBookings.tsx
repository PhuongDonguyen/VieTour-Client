import React, { useEffect } from "react";
import AdminBookingsTable from "../admin/AdminBookings";

const ProviderBookings: React.FC = () => {
  useEffect(() => {
    console.log("ProviderBookings: Page mounted");
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="p-6">
      <AdminBookingsTable />
    </div>
  );
};

export default ProviderBookings;
