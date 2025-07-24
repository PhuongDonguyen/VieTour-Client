import React, { useState, useEffect } from 'react';
import { tourScheduleService } from '../../services/tourSchedule.service';
import { fetchUserProfile } from '../../services/userProfile.service';
import { bookingService } from '../../services/booking.service';
import { getTourPricesByTourIdAndDate } from '../../apis/tourPrice.api';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../Modal';
import LoginForm from '../authentication/LoginForm';
import SignupForm from '../authentication/SignupForm';
import { TourCalendar } from './TourCalendar';
import type { BookingRequest, BookingDetail } from '../../apis/booking.api';

interface TabBookingProps {
  tourId: number;
  tourTitle: string;
  tourPrice: string;
  tourCapacity?: number;
}

interface PriceOption {
  adult_price: number;
  kid_price: number;
  note: string;
  price_type: string;
}

interface AvailableDate {
  id: number;
  start_date: string;
  participant: number;
  status: string;
  tour_id: number;
}

export const TabBooking: React.FC<TabBookingProps> = ({ tourId, tourTitle, tourCapacity = 25 }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [priceOptions, setPriceOptions] = useState<PriceOption[]>([]);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Bước 1: Thông tin tour
    startDate: '',
    numDays: '3 ngày 2 đêm',
    selectedPrices: {} as Record<number, { adults: number; children: number }>,
    
    // Bước 3: Thông tin khách hàng
    customerName: '',
    phone: '',
    
    // Bước 4: Ghi chú và yêu cầu đặc biệt
    specialRequests: ''
  });

  // Function to check if date is valid (at least 2 days from today)
  const isValidBookingDate = (dateString: string) => {
    const today = new Date();
    const bookingDate = new Date(dateString + 'T00:00:00'); // Ensure proper parsing in local timezone
    const twoDaysFromNow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
    
    // Reset time components for accurate date-only comparison
    const bookingDateOnly = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
    const minDateOnly = new Date(twoDaysFromNow.getFullYear(), twoDaysFromNow.getMonth(), twoDaysFromNow.getDate());
    
    console.log(`isValidBookingDate: ${dateString} -> booking: ${bookingDateOnly.toLocaleDateString()}, min: ${minDateOnly.toLocaleDateString()}, valid: ${bookingDateOnly >= minDateOnly}`);
    
    return bookingDateOnly >= minDateOnly;
  };

  // Load tour schedules trước
  useEffect(() => {
    const loadTourSchedules = async () => {
      try {
        console.log('Loading tour schedules for tourId:', tourId);
        const schedulesData = await tourScheduleService.getTourSchedules(tourId);
        console.log('Tour schedules data:', schedulesData);
        
        if (schedulesData.success) {
          // Filter chỉ lấy những ngày từ 2 ngày sau ngày hiện tại
          const validDates = schedulesData.data.filter((date: AvailableDate) => 
            isValidBookingDate(date.start_date)
          );
          setAvailableDates(validDates);
          console.log('Available dates set (filtered):', validDates);
        } else {
          console.log('No success in schedules response');
          setAvailableDates([]);
        }
      } catch (error) {
        console.error('Error loading tour schedules:', error);
        setAvailableDates([]);
      }
    };

    loadTourSchedules();
  }, [tourId]);

  // Load prices khi chuyển sang bước 2 và đã chọn ngày
  useEffect(() => {
    const loadTourPrices = async () => {
      if (currentStep === 2 && formData.startDate) {
        try {
          console.log('Loading tour prices for tourId:', tourId, 'date:', formData.startDate);
          const response: any = await getTourPricesByTourIdAndDate(tourId, formData.startDate);
          console.log('Tour prices response:', response);
          console.log('Response data:', response.data);
          
          // Handle both wrapped response and direct data from axios
          let priceData: PriceOption[] = [];
          
          // Check if response has data field (axios wrapper)
          if (response.data) {
            // If response.data has success field (API wrapper)
            if (response.data.success && response.data.data) {
              priceData = response.data.data;
            } 
            // If response.data is direct array (no API wrapper)
            else if (Array.isArray(response.data)) {
              priceData = response.data;
            }
            // If response.data is object with data field
            else if (response.data.data && Array.isArray(response.data.data)) {
              priceData = response.data.data;
            }
          }
          
          console.log('Parsed price data:', priceData);
          
          if (priceData && priceData.length > 0) {
            console.log('Setting price options:', priceData);
            setPriceOptions(priceData);
            
            // Initialize selectedPrices với default values
            const initialPrices: Record<number, { adults: number; children: number }> = {};
            priceData.forEach((_, index) => {
              initialPrices[index] = { adults: 0, children: 0 };
            });
            setFormData(prev => ({ ...prev, selectedPrices: initialPrices }));
            console.log('Price options set, length:', priceData.length);
          } else {
            console.log('No data found in response');
            setPriceOptions([]);
          }
        } catch (error) {
          console.error('Error loading tour prices:', error);
          setPriceOptions([]);
        }
      }
    };

    loadTourPrices();
  }, [currentStep, formData.startDate, tourId]);

  // Load user profile khi vào bước 3 (thông tin liên hệ)
  useEffect(() => {
    if (currentStep === 3) {
      const loadUserProfile = async () => {
        try {
          const userProfile = await fetchUserProfile();
          if (userProfile.success) {
            const { first_name, last_name, phone } = userProfile.data;
            setFormData(prev => ({
              ...prev,
              customerName: `${first_name} ${last_name}`.trim(),
              phone: phone || ''
            }));
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Không cần làm gì nếu không load được profile
        }
      };

      loadUserProfile();
    }
  }, [currentStep]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateSelect = (dateString: string) => {
    handleInputChange('startDate', dateString);
  };

  const handleNext = () => {
    // Clear previous errors
    setErrors({});
    
    // Kiểm tra validation cho từng bước
    if (currentStep === 1) {
      // Bước 1: Phải chọn ngày khởi hành
      if (!formData.startDate) {
        setErrors({ startDate: 'Vui lòng chọn ngày khởi hành!' });
        return;
      }
    }
    
    if (currentStep === 2) {
      // Bước 2: Phải có ít nhất 1 người lớn
      const totalPeople = getTotalPeople();
      if (totalPeople.totalAdults === 0) {
        setErrors({ quantity: 'Phải có ít nhất 1 người lớn!' });
        return;
      }
      
      // Kiểm tra capacity
      const selectedDate = availableDates.find(date => date.start_date === formData.startDate);
      if (selectedDate) {
        const totalSelected = totalPeople.totalAdults + totalPeople.totalChildren;
        const remainingCapacity = tourCapacity - selectedDate.participant;
        
        if (totalSelected > remainingCapacity) {
          setErrors({ capacity: `Số lượng khách đã chọn (${totalSelected}) vượt quá số vé còn lại (${remainingCapacity})!` });
          return;
        }
      }
    }

    if (currentStep === 3) {
      // Bước 3: Kiểm tra thông tin liên hệ
      const newErrors: Record<string, string> = {};
      
      if (!formData.customerName.trim()) {
        newErrors.customerName = 'Vui lòng nhập họ và tên!';
      }
      
      if (!formData.phone.trim()) {
        newErrors.phone = 'Vui lòng nhập số điện thoại!';
      } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Số điện thoại không hợp lệ!';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent double submission
    
    setIsSubmitting(true);
    
    try {
      // Tìm schedule_id từ ngày đã chọn
      const selectedDate = availableDates.find(date => date.start_date === formData.startDate);
      if (!selectedDate) {
        alert('Không tìm thấy lịch trình cho ngày đã chọn!');
        return;
      }

      // Tạo booking_details từ selectedPrices
      const bookingDetails: BookingDetail[] = [];
      Object.entries(formData.selectedPrices).forEach(([priceIndex, quantities]) => {
        const priceOption = priceOptions[parseInt(priceIndex)];
        if (priceOption && (quantities.adults > 0 || quantities.children > 0)) {
          bookingDetails.push({
            adult_quanti: quantities.adults,
            kid_quanti: quantities.children,
            adult_price: priceOption.adult_price,
            kid_price: priceOption.kid_price,
            note: priceOption.note
          });
        }
      });

      // Tạo booking request data
      const bookingData: BookingRequest = {
        schedule_id: selectedDate.id,
        total: calculateTotalPrice(),
        client_name: formData.customerName,
        client_phone: formData.phone,
        note: formData.specialRequests || '',
        booking_details: bookingDetails
      };

      console.log('Sending booking data:', bookingData);
      
      // Gửi API request
      const response = await bookingService.createBooking(bookingData);
      
      console.log('Booking response:', response);
      alert('Đặt tour thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
      
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Có lỗi xảy ra khi đặt tour. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePriceChange = (priceIndex: number, type: 'adults' | 'children', value: number) => {
    setFormData(prev => ({
      ...prev,
      selectedPrices: {
        ...prev.selectedPrices,
        [priceIndex]: {
          ...prev.selectedPrices[priceIndex],
          [type]: value
        }
      }
    }));
  };

  const calculateTotalPrice = () => {
    let total = 0;
    Object.entries(formData.selectedPrices).forEach(([priceIndex, quantities]) => {
      const priceOption = priceOptions[parseInt(priceIndex)];
      if (priceOption) {
        total += (quantities.adults * priceOption.adult_price) + (quantities.children * priceOption.kid_price);
      }
    });
    return total;
  };

  const getTotalPeople = () => {
    let totalAdults = 0;
    let totalChildren = 0;
    Object.values(formData.selectedPrices).forEach(quantities => {
      totalAdults += quantities.adults;
      totalChildren += quantities.children;
    });
    return { totalAdults, totalChildren };
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <TourCalendar
              availableDates={availableDates}
              tourCapacity={tourCapacity}
              selectedDate={formData.startDate}
              onDateSelect={handleDateSelect}
            />

            {errors.startDate && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errors.startDate}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Chọn số lượng khách</h3>
            
            {formData.startDate && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Ngày khởi hành:</span> {formData.startDate}
                </p>
              </div>
            )}

            {/* Bảng giá cho từng loại */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Chọn số lượng khách cho từng loại giá:</h4>
              
              {/* Debug info */}
              {/* <div className="bg-yellow-50 p-2 rounded text-xs">
                Debug: PriceOptions length: {priceOptions.length}, Current step: {currentStep}, Selected date: {formData.startDate}
              </div> */}
              
              {errors.quantity && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {errors.quantity}
                </div>
              )}
              
              {errors.capacity && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {errors.capacity}
                </div>
              )}
              
              {priceOptions.length === 0 ? (
                <div className="bg-gray-50 p-4 rounded-lg border text-center">
                  <p className="text-gray-600">Đang tải thông tin giá tour...</p>
                  <p className="text-sm text-gray-500 mt-1">Nếu không tải được, có thể không có giá cho ngày này.</p>
                </div>
              ) : (
                priceOptions.map((option, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                  <h5 className="font-semibold text-gray-800 mb-3 capitalize">{option.note}</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                      <div className="text-sm text-gray-600">Giá người lớn: <span className="font-semibold">{option.adult_price.toLocaleString()} VND</span></div>
                      <div className="text-sm text-gray-600">Giá trẻ em: <span className="font-semibold">{option.kid_price.toLocaleString()} VND</span></div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số người lớn
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.selectedPrices[index]?.adults || 0}
                        onChange={(e) => handlePriceChange(index, 'adults', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số trẻ em
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.selectedPrices[index]?.children || 0}
                        onChange={(e) => handlePriceChange(index, 'children', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  
                  {/* Tính tổng cho loại giá này */}
                  {(formData.selectedPrices[index]?.adults > 0 || formData.selectedPrices[index]?.children > 0) && (
                    <div className="mt-3 p-2 bg-white rounded border">
                      <div className="text-sm">
                        Tổng cho {option.note}: <span className="font-semibold text-orange-600">
                          {((formData.selectedPrices[index]?.adults || 0) * option.adult_price + 
                            (formData.selectedPrices[index]?.children || 0) * option.kid_price).toLocaleString()} VND
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))
              )}
            </div>

            {/* Tổng cộng toàn bộ */}
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Tổng số khách:</span>
                  <span className="font-semibold">{getTotalPeople().totalAdults} người lớn, {getTotalPeople().totalChildren} trẻ em</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold text-orange-600">
                    <span>Tổng cộng:</span>
                    <span>{calculateTotalPrice().toLocaleString()} VND</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Thông tin liên hệ</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.customerName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Họ và tên sẽ được tự động điền từ profile của bạn"
                />
                {errors.customerName && (
                  <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Số điện thoại sẽ được tự động điền từ profile của bạn"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Lưu ý:</strong> Thông tin họ tên và số điện thoại sẽ được tự động điền từ profile của bạn. 
                  Bạn có thể chỉnh sửa nếu cần thiết.
                </p>
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Ghi chú và yêu cầu đặc biệt</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú và yêu cầu đặc biệt
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Nhập ghi chú và yêu cầu đặc biệt (nếu có)..."
              />
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Xác nhận thông tin đặt tour</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 className="font-semibold text-gray-800">Thông tin tour:</h4>
              <p><span className="font-medium">Tour ID:</span> {tourId}</p>
              <p><span className="font-medium">Tour:</span> {tourTitle}</p>
              <p><span className="font-medium">Ngày khởi hành:</span> {formData.startDate}</p>
              <p><span className="font-medium">Thời gian:</span> {formData.numDays}</p>
              
              <div className="mt-4">
                <h5 className="font-medium text-gray-800 mb-2">Chi tiết đặt chỗ:</h5>
                {priceOptions.map((option, index) => {
                  const quantities = formData.selectedPrices[index];
                  if (quantities && (quantities.adults > 0 || quantities.children > 0)) {
                    return (
                      <div key={index} className="ml-4 text-sm">
                        <p><span className="font-medium capitalize">{option.note}:</span> {quantities.adults} người lớn, {quantities.children} trẻ em</p>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
              
              <p><span className="font-medium">Tổng số khách:</span> {getTotalPeople().totalAdults} người lớn, {getTotalPeople().totalChildren} trẻ em</p>
              <p><span className="font-medium">Tổng giá tour:</span> <span className="text-xl font-bold text-orange-600">{calculateTotalPrice().toLocaleString()} VND</span></p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 className="font-semibold text-gray-800">Thông tin liên hệ:</h4>
              <p><span className="font-medium">Họ tên:</span> {formData.customerName}</p>
              <p><span className="font-medium">Số điện thoại:</span> {formData.phone}</p>
            </div>
            
            {formData.specialRequests && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-gray-800">Ghi chú và yêu cầu đặc biệt:</h4>
                <p>{formData.specialRequests}</p>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <>
      {/* Hiển thị form đăng nhập nếu chưa đăng nhập */}
      {!user ? (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
          <div className="text-center py-12">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Đăng nhập để đặt tour
              </h3>
              <p className="text-gray-600">
                Bạn cần đăng nhập để có thể đặt tour và quản lý đặt chỗ
              </p>
            </div>
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-8 py-3 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 transition-colors"
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
              {step < 5 && (
                <div
                  className={`w-12 h-1 mx-1 ${
                    step < currentStep ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>Chọn ngày</span>
          <span>Số lượng</span>
          <span>Liên hệ</span>
          <span>Yêu cầu</span>
          <span>Xác nhận</span>
        </div>
      </div>

      {/* Step content */}
      <div className="mb-8">
        {renderStep()}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className={`px-6 py-2 rounded-md font-medium ${
            currentStep === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
          }`}
        >
          Quay lại
        </button>
        
        {currentStep < 5 ? (
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 transition-colors"
          >
            Tiếp tục
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              isSubmitting
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Đặt tour ngay'}
          </button>
        )}
      </div>
        </div>
      )}

      {/* Modal đăng nhập */}
      <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
        {showSignupForm ? (
          <SignupForm
            onClose={() => setShowLoginModal(false)}
            onSwitchForm={() => setShowSignupForm(false)}
          />
        ) : (
          <LoginForm
            onClose={() => setShowLoginModal(false)}
            onSwitchForm={() => setShowSignupForm(true)}
          />
        )}
      </Modal>
    </>
  );
};
