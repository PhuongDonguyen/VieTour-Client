import React from 'react';

type TabConditionProps = {
  tour_info?: string;
};

const TabCondition: React.FC<TabConditionProps> = ({ tour_info }) => (
  <div className="p-6 md:p-8">
    {tour_info ? (
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: tour_info }} />
    ) : (
      <div className="text-center text-gray-500">Chưa có điều kiện tour.</div>
    )}
  </div>
);

export default TabCondition; 