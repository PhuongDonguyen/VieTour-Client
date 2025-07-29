import React from "react";
import AdminCancellationRequestsTable from "../../components/admin/AdminCancellationRequestsTable";

const CancellationRequests: React.FC = () => {
  return (
    <div className="p-6">
      <AdminCancellationRequestsTable />
    </div>
  );
};

export default CancellationRequests;
