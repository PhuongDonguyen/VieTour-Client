import React, { useState } from 'react';

interface AvailableDate {
  id: number;
  start_date: string;
  participant: number;
  status: string;
  tour_id: number;
}

interface TourCalendarProps {
  availableDates: AvailableDate[];
  tourCapacity: number;
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

interface CalendarDay {
  date: Date;
  dateString: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelectable: boolean;
  isSelected: boolean;
  availableSlots: number;
  scheduleIds: number[];
}

export const TourCalendar: React.FC<TourCalendarProps> = ({
  availableDates = [],
  tourCapacity = 50, // Default capacity if not provided
  selectedDate,
  onDateSelect,
}) => {
  // Early return if no available dates
  if (!availableDates || availableDates.length === 0) {
    console.warn('No available dates provided to TourCalendar');
  }
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  // Get current date in local timezone (UTC+7)
  const today = new Date();
  const minSelectableDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
  // Reset time to start of day to avoid timezone issues
  minSelectableDate.setHours(0, 0, 0, 0);

  // Get the initial month (current month)
  const initialMonth = new Date().getMonth();
  const initialYear = new Date().getFullYear();

  const formatDateString = (date: Date): string => {
    // Ensure we're working with local timezone (UTC+7)
    const localDate = new Date(date.getTime());
    const year = localDate.getFullYear();
    const month = (localDate.getMonth() + 1).toString().padStart(2, '0');
    const day = localDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Debug logging for timezone verification
  console.log('Today (local):', formatDateString(today));
  console.log('Min selectable date (local):', formatDateString(minSelectableDate));
  console.log('Available dates from API:', availableDates.map(d => d.start_date));
  console.log('Tour capacity:', tourCapacity);
  console.log('Available dates data:', availableDates);

  const isDateSelectable = (date: Date): boolean => {
    // Create dates using local timezone components to avoid timezone shifts
    const dateToCheck = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const minDate = new Date(minSelectableDate.getFullYear(), minSelectableDate.getMonth(), minSelectableDate.getDate());
    
    // Compare dates (both are in local timezone)
    return dateToCheck >= minDate;
  };

  const getAvailableSlotsForDate = (dateString: string): { slots: number; scheduleIds: number[] } => {
    const schedules = availableDates.filter(
      schedule => schedule.start_date === dateString && schedule.status === 'available'
    );
    
    console.log(`Checking slots for ${dateString}:`, schedules);
    
    if (schedules.length === 0) {
      return { slots: 0, scheduleIds: [] };
    }

    // Tính tổng số chỗ trống cho tất cả schedule trong ngày
    const totalSlots = schedules.reduce((total, schedule) => {
      const remainingSlots = tourCapacity - schedule.participant;
      console.log(`Schedule ${schedule.id}: capacity=${tourCapacity}, participant=${schedule.participant}, remaining=${remainingSlots}`);
      return total + Math.max(0, remainingSlots);
    }, 0);

    const scheduleIds = schedules.map(s => s.id);
    
    console.log(`Total slots for ${dateString}:`, totalSlots);
    return { slots: totalSlots, scheduleIds };
  };

  const generateCalendarDays = (year: number, month: number): CalendarDay[] => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days: CalendarDay[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({
        date: new Date(),
        dateString: '',
        isCurrentMonth: false,
        isToday: false,
        isSelectable: false,
        isSelected: false,
        availableSlots: 0,
        scheduleIds: [],
      });
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = formatDateString(date);
      const { slots, scheduleIds } = getAvailableSlotsForDate(dateString);
      
      const isDateSelectableResult = isDateSelectable(date);
      const hasSlots = slots > 0;
      const finalIsSelectable = isDateSelectableResult && hasSlots;
      
      if (dateString === '2025-07-26' || dateString === '2025-08-02' || dateString === '2025-08-05') {
        console.log(`Date ${dateString}: isDateSelectable=${isDateSelectableResult}, hasSlots=${hasSlots}, slots=${slots}, finalSelectable=${finalIsSelectable}`);
      }
      
      days.push({
        date,
        dateString,
        isCurrentMonth: true,
        isToday: formatDateString(date) === formatDateString(today),
        isSelectable: finalIsSelectable,
        isSelected: dateString === selectedDate,
        availableSlots: slots,
        scheduleIds,
      });
    }

    // Add empty slots to complete the calendar grid (6 weeks * 7 days = 42)
    const remainingDays = 42 - days.length;
    for (let i = 0; i < remainingDays; i++) {
      days.push({
        date: new Date(),
        dateString: '',
        isCurrentMonth: false,
        isToday: false,
        isSelectable: false,
        isSelected: false,
        availableSlots: 0,
        scheduleIds: [],
      });
    }

    return days;
  };

  const canGoToPreviousMonth = (): boolean => {
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const currentMonth = new Date(initialYear, initialMonth, 1);
    return prevMonth >= currentMonth;
  };

  const goToPreviousMonth = () => {
    if (canGoToPreviousMonth()) {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const currentMonthDays = generateCalendarDays(currentDate.getFullYear(), currentDate.getMonth());
  const nextMonthDays = generateCalendarDays(currentDate.getFullYear(), currentDate.getMonth() + 1);

  const handleDateClick = (day: CalendarDay) => {
    if (day.isSelectable) {
      onDateSelect(day.dateString);
    }
  };

  const formatDisplayDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Chọn ngày khởi hành</h3>
        <p className="text-sm text-gray-600">
          Chỉ có thể chọn ngày từ {formatDisplayDate(formatDateString(minSelectableDate))} trở đi
        </p>
        {selectedDate && (
          <div className="mt-2 p-2 bg-green-100 rounded">
            <p className="text-green-800 font-medium">
              Ngày đã chọn: {formatDisplayDate(selectedDate)}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={goToPreviousMonth}
          disabled={!canGoToPreviousMonth()}
          className={`px-4 py-2 rounded-md border ${
            canGoToPreviousMonth()
              ? 'hover:bg-gray-100 text-gray-600 border-gray-300'
              : 'text-gray-300 cursor-not-allowed border-gray-200'
          }`}
        >
          &#8249; Tháng trước
        </button>
        <button
          type="button"
          onClick={goToNextMonth}
          className="px-4 py-2 rounded-md border hover:bg-gray-100 text-gray-600 border-gray-300"
        >
          Tháng sau &#8250;
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* First Calendar */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-center mb-4">
            <h4 className="text-lg font-semibold text-gray-800">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h4>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {currentMonthDays.map((day, index) => (
              <div
                key={index}
                className="relative p-2 text-sm rounded-md transition-colors duration-200 min-h-[60px]"
              >
                {day.isCurrentMonth ? (
                  <button
                    type="button"
                    onClick={() => handleDateClick(day)}
                    disabled={!day.isSelectable}
                    className={`
                      w-full h-full rounded-md transition-colors duration-200
                      ${day.isToday ? 'bg-blue-100 text-blue-800 font-bold' : ''}
                      ${day.isSelected ? 'bg-orange-500 text-white font-bold' : ''}
                      ${day.isSelectable && !day.isSelected ? 'hover:bg-orange-100 text-gray-900 cursor-pointer' : ''}
                      ${!day.isSelectable ? 'text-gray-300 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className="mb-1">{day.date.getDate()}</span>
                      {day.availableSlots > 0 && (
                        <span className="text-xs text-green-600 font-medium">
                          {day.availableSlots} chỗ
                        </span>
                      )}
                    </div>
                  </button>
                ) : (
                  <div className="w-full h-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Second Calendar */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-center mb-4">
            <h4 className="text-lg font-semibold text-gray-800">
              {monthNames[currentDate.getMonth() + 1] || monthNames[0]} {
                currentDate.getMonth() === 11 ? currentDate.getFullYear() + 1 : currentDate.getFullYear()
              }
            </h4>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {nextMonthDays.map((day, index) => (
              <div
                key={index}
                className="relative p-2 text-sm rounded-md transition-colors duration-200 min-h-[60px]"
              >
                {day.isCurrentMonth ? (
                  <button
                    type="button"
                    onClick={() => handleDateClick(day)}
                    disabled={!day.isSelectable}
                    className={`
                      w-full h-full rounded-md transition-colors duration-200
                      ${day.isToday ? 'bg-blue-100 text-blue-800 font-bold' : ''}
                      ${day.isSelected ? 'bg-orange-500 text-white font-bold' : ''}
                      ${day.isSelectable && !day.isSelected ? 'hover:bg-orange-100 text-gray-900 cursor-pointer' : ''}
                      ${!day.isSelectable ? 'text-gray-300 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className="mb-1">{day.date.getDate()}</span>
                      {day.availableSlots > 0 && (
                        <span className="text-xs text-green-600 font-medium">
                          {day.availableSlots} chỗ
                        </span>
                      )}
                    </div>
                  </button>
                ) : (
                  <div className="w-full h-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h5 className="font-medium text-gray-800 mb-2">Chú thích:</h5>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
            <span>Hôm nay</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span>Ngày đã chọn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
            <span>Có thể chọn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <span>Không thể chọn</span>
          </div>
        </div>
      </div>
    </div>
  );
};
