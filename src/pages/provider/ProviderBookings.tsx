import React, { useEffect } from "react";
import ProviderBookingsTable from "../../components/provider/ProviderBookingsTable";

const ProviderBookings: React.FC = () => {
  useEffect(() => {
    console.log("ProviderBookings: Page mounted");
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="p-6">
      <ProviderBookingsTable />
    </div>
  );
};

export default ProviderBookings;
 