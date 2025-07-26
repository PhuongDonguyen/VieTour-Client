import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

// Mock data - bạn sẽ thay thế bằng API thực tế
const mockBookingData = {
  id: 1,
  tourTitle: "Tour Tây Bắc 3 ngày 2 đêm",
  startDate: "2025-08-15",
  totalAmount: 1500000,
  customerName: "HO VAN PHU",
  customerPhone: "0966802503",
  status: "confirmed"
};

// Constants cho chính sách hoàn tiền
const REFUND_POLICY = {
  DAYS_15_OR_MORE: { days: 15, percentage: 100, label: "15 ngày hoặc hơn" },
  DAYS_7_TO_14: { days: 7, percentage: 50, label: "7-14 ngày" },
  DAYS_4_TO_6: { days: 4, percentage: 20, label: "4-6 ngày" },
  UNDER_4_DAYS: { days: 0, percentage: 0, label: "Dưới 4 ngày" }
};

const CancelBooking: React.FC = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState(mockBookingData);
  const [refundInfo, setRefundInfo] = useState({
    daysUntilTour: 0,
    refundPercentage: 0,
    refundAmount: 0
  });
  const [bankInfo, setBankInfo] = useState({
    recipientName: '',
    bankName: '',
    accountNumber: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tính toán số ngày và phần trăm hoàn tiền
  useEffect(() => {
    const today = new Date();
    const tourDate = new Date(bookingData.startDate);
    const diffTime = tourDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let percentage = 0;
    if (diffDays >= 15) {
      percentage = REFUND_POLICY.DAYS_15_OR_MORE.percentage;
    } else if (diffDays >= 7) {
      percentage = REFUND_POLICY.DAYS_7_TO_14.percentage;
    } else if (diffDays >= 4) {
      percentage = REFUND_POLICY.DAYS_4_TO_6.percentage;
    } else {
      percentage = REFUND_POLICY.UNDER_4_DAYS.percentage;
    }

    const refundAmount = (bookingData.totalAmount * percentage) / 100;

    setRefundInfo({
      daysUntilTour: diffDays,
      refundPercentage: percentage,
      refundAmount: refundAmount
    });
  }, [bookingData.startDate, bookingData.totalAmount]);

  const handleNext = () => {
    if (currentStep === 1) {
      if (refundInfo.refundPercentage === 0) {
        toast.error('Rất tiếc, tour của bạn không thể hoàn tiền theo chính sách!');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate bank info
      if (!bankInfo.recipientName.trim()) {
        toast.error('Vui lòng nhập tên người nhận!');
        return;
      }
      if (!bankInfo.bankName.trim()) {
        toast.error('Vui lòng nhập tên ngân hàng!');
        return;
      }
      if (!bankInfo.accountNumber.trim()) {
        toast.error('Vui lòng nhập số tài khoản!');
        return;
      }
      if (!bankInfo.phone.trim()) {
        toast.error('Vui lòng nhập số điện thoại!');
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Gọi API để tạo yêu cầu hủy tour
      // const response = await cancelBookingRequest({
      //   bookingId: bookingData.id,
      //   bankInfo: bankInfo,
      //   refundAmount: refundInfo.refundAmount
      // });

      // Mock success
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Yêu cầu hủy tour đã được gửi thành công!');
      navigate('/user/my-bookings');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-blue-900 mb-4">Thông tin tour muốn hủy</h3>
        <div className="space-y-3">
          <p><span className="font-medium">Tour:</span> {bookingData.tourTitle}</p>
          <p><span className="font-medium">Ngày khởi hành:</span> {bookingData.startDate}</p>
          <p><span className="font-medium">Tổng tiền:</span> {bookingData.totalAmount.toLocaleString()} VND</p>
          <p><span className="font-medium">Số ngày còn lại:</span> <span className="text-blue-600 font-semibold">{refundInfo.daysUntilTour} ngày</span></p>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Chính sách hoàn tiền</h3>
        
        <div className="space-y-4">
          {Object.values(REFUND_POLICY).map((policy, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border-2 ${
                (refundInfo.daysUntilTour >= policy.days && policy.percentage > 0) ||
                (policy.percentage === 0 && refundInfo.daysUntilTour < 4)
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  Hủy {policy.label} trước ngày khởi hành:
                </span>
                <span className={`font-bold text-lg ${
                  policy.percentage > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {policy.percentage}% hoàn tiền
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">Áp dụng cho tour của bạn:</h4>
          <div className="text-lg">
            <span className="text-gray-700">Số tiền hoàn lại: </span>
            <span className={`font-bold text-xl ${
              refundInfo.refundAmount > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {refundInfo.refundAmount.toLocaleString()} VND
            </span>
            <span className="text-gray-600 ml-2">
              ({refundInfo.refundPercentage}% của {bookingData.totalAmount.toLocaleString()} VND)
            </span>
          </div>
        </div>

        {refundInfo.refundPercentage === 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">
              ⚠️ Rất tiếc, tour của bạn không thể được hoàn tiền theo chính sách của chúng tôi.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-green-900 mb-2">Thông tin hoàn tiền</h3>
        <p className="text-green-700">
          Số tiền sẽ được hoàn: <span className="font-bold text-xl">{refundInfo.refundAmount.toLocaleString()} VND</span>
        </p>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Thông tin người nhận tiền</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên người nhận *
            </label>
            <input
              type="text"
              value={bankInfo.recipientName}
              onChange={(e) => setBankInfo(prev => ({ ...prev, recipientName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Nhập tên chủ tài khoản ngân hàng"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên ngân hàng *
            </label>
            <input
              type="text"
              value={bankInfo.bankName}
              onChange={(e) => setBankInfo(prev => ({ ...prev, bankName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Ví dụ: Vietcombank, Techcombank, BIDV..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số tài khoản *
            </label>
            <input
              type="text"
              value={bankInfo.accountNumber}
              onChange={(e) => setBankInfo(prev => ({ ...prev, accountNumber: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Nhập số tài khoản ngân hàng"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại *
            </label>
            <input
              type="tel"
              value={bankInfo.phone}
              onChange={(e) => setBankInfo(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Số điện thoại để liên hệ xác nhận"
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700 text-sm">
            <strong>Lưu ý:</strong> Vui lòng kiểm tra kỹ thông tin ngân hàng. Chúng tôi sẽ chuyển tiền hoàn lại trong vòng 3-5 ngày làm việc sau khi duyệt yêu cầu.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-yellow-900 mb-4">Xác nhận thông tin hủy tour</h3>
        
        <div className="space-y-4">
          <div className="bg-white p-4 rounded border">
            <h4 className="font-semibold text-gray-800 mb-2">Thông tin tour:</h4>
            <p><span className="font-medium">Tour:</span> {bookingData.tourTitle}</p>
            <p><span className="font-medium">Ngày khởi hành:</span> {bookingData.startDate}</p>
            <p><span className="font-medium">Tổng tiền gốc:</span> {bookingData.totalAmount.toLocaleString()} VND</p>
          </div>

          <div className="bg-white p-4 rounded border">
            <h4 className="font-semibold text-gray-800 mb-2">Thông tin hoàn tiền:</h4>
            <p><span className="font-medium">Tỷ lệ hoàn tiền:</span> {refundInfo.refundPercentage}%</p>
            <p><span className="font-medium text-green-600">Số tiền hoàn lại:</span> 
               <span className="text-green-600 font-bold text-lg ml-1">{refundInfo.refundAmount.toLocaleString()} VND</span>
            </p>
          </div>

          <div className="bg-white p-4 rounded border">
            <h4 className="font-semibold text-gray-800 mb-2">Thông tin người nhận:</h4>
            <p><span className="font-medium">Tên người nhận:</span> {bankInfo.recipientName}</p>
            <p><span className="font-medium">Ngân hàng:</span> {bankInfo.bankName}</p>
            <p><span className="font-medium">Số tài khoản:</span> {bankInfo.accountNumber}</p>
            <p><span className="font-medium">Số điện thoại:</span> {bankInfo.phone}</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">
            ⚠️ Sau khi xác nhận, yêu cầu hủy tour không thể hoàn tác. Vui lòng kiểm tra kỹ thông tin trước khi gửi.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6">
            <h1 className="text-2xl font-bold">Yêu cầu hủy tour</h1>
            <p className="text-red-100 mt-2">Vui lòng đọc kỹ chính sách hoàn tiền trước khi tiếp tục</p>
          </div>

          {/* Progress indicator */}
          <div className="bg-gray-50 p-4">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-16 h-1 mx-2 ${
                        step < currentStep ? 'bg-red-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600 max-w-md mx-auto">
              <span>Chính sách</span>
              <span>Thông tin</span>
              <span>Xác nhận</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </div>

          {/* Actions */}
          <div className="bg-gray-50 p-6">
            <div className="flex justify-between">
              <button
                onClick={() => navigate('/user/my-bookings')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>

              <div className="space-x-3">
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Bước trước
                  </button>
                )}

                {currentStep < 3 ? (
                  <button
                    onClick={handleNext}
                    disabled={currentStep === 1 && refundInfo.refundPercentage === 0}
                    className={`px-6 py-2 rounded-md font-medium transition-colors ${
                      currentStep === 1 && refundInfo.refundPercentage === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
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
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {isSubmitting ? 'Đang gửi...' : 'Xác nhận hủy tour'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelBooking;
