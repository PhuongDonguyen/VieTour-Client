import React from 'react';

type TourDetailDay = {
  id: number;
  title: string;
  order: number;
  morning_description: string;
  noon_description: string;
  afternoon_description: string;
};

interface TourDetailContentProps {
  days: TourDetailDay[];
}

function addListClassToHtml(html: string) {
  return html.replace(/<ul(.*?)>/g, '<ul$1 class="list-disc pl-5">');
}

const TourDetailContent: React.FC<TourDetailContentProps> = ({ days }) => {
  return (
    <div className="space-y-8">
      {days.map((day) => (
        <div key={day.id} className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 text-white rounded-full px-4 py-1 font-bold text-lg">Ngày {day.order}</div>
            <h2 className="text-xl font-bold text-blue-700">{day.title}</h2>
          </div>
          <div className="mt-2">
            <div className="mb-3">
              <div className="font-semibold text-red-600 text-base mb-1">Buổi sáng:</div>
              <div className="text-gray-800 text-sm" dangerouslySetInnerHTML={{ __html: addListClassToHtml(day.morning_description) }} />
            </div>
            <div className="mb-3">
              <div className="font-semibold text-red-600 text-base mb-1">Buổi trưa:</div>
              <div className="text-gray-800 text-sm" dangerouslySetInnerHTML={{ __html: addListClassToHtml(day.noon_description) }} />
            </div>
            <div>
              <div className="font-semibold text-red-600 text-base mb-1">Buổi chiều:</div>
              <div className="text-gray-800 text-sm" dangerouslySetInnerHTML={{ __html: addListClassToHtml(day.afternoon_description) }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TourDetailContent; 