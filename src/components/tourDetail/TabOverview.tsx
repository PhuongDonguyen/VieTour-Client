import React from 'react';

type TabOverviewProps = {
  destination_intro?: string;
};

const TabOverview: React.FC<TabOverviewProps> = ({ destination_intro }) => (
  <div className="w-full max-w-7xl mx-auto p-6 md:p-8">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Tổng quan tour</h2>
    {destination_intro ? (
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: destination_intro }} />
    ) : (
      <div className="text-center text-gray-500">Chưa có tổng quan tour.</div>
    )}
  </div>
);

export default TabOverview; 