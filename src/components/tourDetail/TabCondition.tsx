import React from 'react';

type TabConditionProps = {
  tour_info?: string;
};

const TabCondition: React.FC<TabConditionProps> = ({ tour_info }) => (
  <div className="w-full max-w-7xl mx-auto p-6 md:p-8">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Điều kiện tour</h2>
    {tour_info ? (
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: tour_info }} />
    ) : (
      <div className="text-center text-gray-500">Chưa có điều kiện tour.</div>
    )}
  </div>
);

export default TabCondition; 