import React, { useState, useEffect } from 'react';

interface TabBookingProps {
  tourId: number;
  tourTitle: string;
  tourPrice: string;
}

interface PriceOption {
  id: number;
  adult_price: number;
  kid_price: number;
  note: string;
  tour_id: number;
}

interface AvailableDate {
  id: number;
  start_date: string;
  booked_count: number;
  status: string;
  tour_id: number;
}

export const TabBooking: React.FC<TabBookingProps> = ({ tourId, tourTitle, tourPrice }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [priceOptions, setPriceOptions] = useState<PriceOption[]>([]);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [tourCapacity, setTourCapacity] = useState(25); // Capacity từ API
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    // Bước 1: Thông tin tour
    startDate: '',
    numDays: '3 ngày 2 đêm',
    selectedPrices: {} as Record<number, { adults: number; children: number }>,
    
    // Bước 2: Thông tin khách hàng
    customerName: '',
    email: '',
    phone: '',
    address: '',
    
    // Bước 3: Yêu cầu đặc biệt
    specialRequests: '',
    notes: ''
  });

  // Function to format date to Vietnamese format
  const formatDateToVietnamese = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Mock API data - trong thực tế sẽ gọi API
  useEffect(() => {
    // Mock price data
    const mockPriceData = [
      {
        id: 1,
        adult_price: 1000000,
        kid_price: 500000,
        note: "người việt nam",
        tour_id: 1
      },
      {
        id: 2,
        adult_price: 900000,
        kid_price: 500000,
        note: "người nước ngoài",
        tour_id: 1
      }
    ];

    // Mock available dates data - filter by current tourId
    const mockDateData = [
      {
        id: 2,
        start_date: "2025-07-02",
        booked_count: 0,
        status: "Booked",
        tour_id: 1
      },
      {
        id: 8,
        start_date: "2025-07-02",
        booked_count: 10,
        status: "Booked",
        tour_id: 1
      },
      {
        id: 11,
        start_date: "2025-07-05",
        booked_count: 15,
        status: "Booked",
        tour_id: 1
      }
    ];

    setPriceOptions(mockPriceData);
    setAvailableDates(mockDateData.filter(date => date.tour_id === tourId));
    
    // Initialize selectedPrices với default values
    const initialPrices: Record<number, { adults: number; children: number }> = {};
    mockPriceData.forEach(price => {
      initialPrices[price.id] = { adults: 0, children: 0 };
    });
    setFormData(prev => ({ ...prev, selectedPrices: initialPrices }));
  }, [tourId]);

  // Load giá khi chọn ngày (chuẩn bị cho API call)
  useEffect(() => {
    if (formData.startDate) {
      console.log('Load giá cho ngày:', formData.startDate);
      // TODO: Gọi API để load giá theo ngày đã chọn
      // Có thể có giá đặc biệt cho những ngày nhất định
      
      // Ví dụ: 
      // fetchPricesByDate(tourId, formData.startDate)
      //   .then(prices => setPriceOptions(prices))
      //   .catch(err => console.error('Error loading prices:', err));
    }
  }, [formData.startDate, tourId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
        const remainingCapacity = tourCapacity - selectedDate.booked_count;
        
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
      
      if (!formData.email.trim()) {
        newErrors.email = 'Vui lòng nhập email!';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email không hợp lệ!';
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

  const handleSubmit = () => {
    // Xử lý đặt tour
    console.log('Đặt tour:', { tourId: 1, ...formData });
    alert('Đặt tour thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
  };

  const handlePriceChange = (priceId: number, type: 'adults' | 'children', value: number) => {
    setFormData(prev => ({
      ...prev,
      selectedPrices: {
        ...prev.selectedPrices,
        [priceId]: {
          ...prev.selectedPrices[priceId],
          [type]: value
        }
      }
    }));
  };

  const calculateTotalPrice = () => {
    let total = 0;
    Object.entries(formData.selectedPrices).forEach(([priceId, quantities]) => {
      const priceOption = priceOptions.find(p => p.id === parseInt(priceId));
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
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Chọn ngày khởi hành</h3>
            
            {/* Tour ID hiển thị */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Tour ID: <span className="font-semibold text-blue-600">1</span></p>
              <h4 className="text-lg font-bold text-blue-800 my-2">Tour Tây Bắc 3 ngày 2 đêm</h4>
              <p className="text-sm text-gray-600">Thời gian: <span className="font-semibold">{formData.numDays}</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày khởi hành *
                </label>
                <select
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Chọn ngày khởi hành</option>
                  {availableDates.map(date => (
                    <option key={date.id} value={date.start_date}>
                      {formatDateToVietnamese(date.start_date)} (Đã đặt: {date.booked_count}/{tourCapacity})
                    </option>
                  ))}
                </select>
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                )}
              </div>
            </div>

            {formData.startDate && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-green-800">
                  <span className="font-semibold">Ngày đã chọn:</span> {formData.startDate}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Bấm "Tiếp tục" để chọn số lượng khách và xem giá chi tiết
                </p>
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
              
              {priceOptions.map(option => (
                <div key={option.id} className="bg-gray-50 p-4 rounded-lg border">
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
                        value={formData.selectedPrices[option.id]?.adults || 0}
                        onChange={(e) => handlePriceChange(option.id, 'adults', parseInt(e.target.value) || 0)}
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
                        value={formData.selectedPrices[option.id]?.children || 0}
                        onChange={(e) => handlePriceChange(option.id, 'children', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  
                  {/* Tính tổng cho loại giá này */}
                  {(formData.selectedPrices[option.id]?.adults > 0 || formData.selectedPrices[option.id]?.children > 0) && (
                    <div className="mt-3 p-2 bg-white rounded border">
                      <div className="text-sm">
                        Tổng cho {option.note}: <span className="font-semibold text-orange-600">
                          {((formData.selectedPrices[option.id]?.adults || 0) * option.adult_price + 
                            (formData.selectedPrices[option.id]?.children || 0) * option.kid_price).toLocaleString()} VND
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="Nhập họ và tên"
                />
                {errors.customerName && (
                  <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
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
                  placeholder="Nhập số điện thoại"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Nhập địa chỉ"
                />
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Yêu cầu đặc biệt</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yêu cầu đặc biệt
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Nhập yêu cầu đặc biệt (nếu có)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú thêm
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Ghi chú thêm (nếu có)"
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
              <p><span className="font-medium">Tour ID:</span> 1</p>
              <p><span className="font-medium">Tour:</span> {tourTitle}</p>
              <p><span className="font-medium">Ngày khởi hành:</span> {formData.startDate}</p>
              <p><span className="font-medium">Thời gian:</span> {formData.numDays}</p>
              
              <div className="mt-4">
                <h5 className="font-medium text-gray-800 mb-2">Chi tiết đặt chỗ:</h5>
                {priceOptions.map(option => {
                  const quantities = formData.selectedPrices[option.id];
                  if (quantities && (quantities.adults > 0 || quantities.children > 0)) {
                    return (
                      <div key={option.id} className="ml-4 text-sm">
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
              <p><span className="font-medium">Email:</span> {formData.email}</p>
              <p><span className="font-medium">Số điện thoại:</span> {formData.phone}</p>
              <p><span className="font-medium">Địa chỉ:</span> {formData.address}</p>
            </div>
            
            {(formData.specialRequests || formData.notes) && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-gray-800">Yêu cầu đặc biệt:</h4>
                {formData.specialRequests && <p>{formData.specialRequests}</p>}
                {formData.notes && <p><span className="font-medium">Ghi chú:</span> {formData.notes}</p>}
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
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
            className="px-6 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors"
          >
            Đặt tour ngay
          </button>
        )}
      </div>
    </div>
  );
};
