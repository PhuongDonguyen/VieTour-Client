import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { fetchBookingById } from "../services/booking.service";
import { refundRateService } from "../services/refundRate.service";
import { cancellationRequestService } from "../services/cancellationRequest.service";
import { bookingService } from "../services/booking.service";
import BankSelector from "../components/BankSelector";

// Mock data - bạn sẽ thay thế bằng API thực tế
const mockBookingData = {
  id: 1,
  tourTitle: "Tour Tây Bắc 3 ngày 2 đêm",
  startDate: "2025-08-15",
  totalAmount: 1500000,
  customerName: "HO VAN PHU",
  customerPhone: "0966802503",
  status: "confirmed",
};

// Constants cho chính sách hoàn tiền
const REFUND_POLICY = {
  DAYS_15_OR_MORE: { days: 15, percentage: 100, label: "15 ngày hoặc hơn" },
  DAYS_7_TO_14: { days: 7, percentage: 50, label: "7-14 ngày" },
  DAYS_4_TO_6: { days: 4, percentage: 20, label: "4-6 ngày" },
  UNDER_4_DAYS: { days: 0, percentage: 0, label: "Dưới 4 ngày" },
};

// Helper format percentage
const formatPercent = (value: number | string) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return Number.isInteger(num)
    ? `${num}%`
    : `${num.toFixed(2).replace(/\.00$/, "")}%`;
};

const CancelBooking: React.FC = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<any>(null);
  const [refundRates, setRefundRates] = useState<any[]>([]);
  const [refundInfo, setRefundInfo] = useState({
    daysUntilTour: 0,
    refundPercentage: 0,
    refundAmount: 0,
    applicablePolicy: null as any,
  });
  const [bankInfo, setBankInfo] = useState({
    recipientName: "",
    bankName: "",
    accountNumber: "",
    phone: "",
  });
  const [cancelReason, setCancelReason] = useState("");

  // Các lý do hủy phổ biến
  const commonReasons = [
    "Thay đổi lịch trình cá nhân",
    "Có việc đột xuất không thể tham gia",
    "Thời tiết không thuận lợi",
    "Sức khỏe không đảm bảo",
    "Thay đổi địa điểm du lịch",
    "Lý do khác",
  ];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancellationLoading, setShowCancellationLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load booking data & refund rates khi mở trang
  useEffect(() => {
    const loadData = async () => {
      if (!bookingId) return;
      setIsLoading(true);
      try {
        const booking = await fetchBookingById(Number(bookingId));
        setBookingData(booking.data);
        const ratesRes = await refundRateService.getRefundRates();
        setRefundRates(ratesRes.data.data);
      } catch (err) {
        console.error(err);
        toast.error(
          "Không thể tải dữ liệu đặt tour hoặc chính sách hoàn tiền!"
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [bookingId]);

  // Tính toán số ngày và phần trăm hoàn tiền dựa trên refundRates
  useEffect(() => {
    if (!bookingData || !refundRates.length) return;
    const today = new Date();
    const tourDate = new Date(
      bookingData.schedule?.start_date || bookingData.startDate
    );
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const tourDateOnly = new Date(
      tourDate.getFullYear(),
      tourDate.getMonth(),
      tourDate.getDate()
    );
    const diffTime = tourDateOnly.getTime() - todayOnly.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // Tìm policy phù hợp
    const applicablePolicy = refundRates.find(
      (rate) => diffDays >= rate.from_day && diffDays <= rate.to_day
    );
    const percentage = applicablePolicy
      ? parseFloat(applicablePolicy.refund_percentage)
      : 0;
    const totalAmount = bookingData.total || bookingData.totalAmount;
    const refundAmount = (totalAmount * percentage) / 100;
    setRefundInfo({
      daysUntilTour: diffDays,
      refundPercentage: percentage,
      refundAmount,
      applicablePolicy,
    });
  }, [bookingData, refundRates]);

  const handleNext = () => {
    // Clear previous errors
    setErrors({});

    if (currentStep === 1) {
      if (refundInfo.refundPercentage === 0) {
        toast.error(
          "Rất tiếc, tour của bạn không thể hoàn tiền theo chính sách!"
        );
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate bank info
      const newErrors: Record<string, string> = {};

      if (!cancelReason.trim()) {
        newErrors.cancelReason = "Vui lòng nhập lý do hủy tour!";
      }

      if (!bankInfo.recipientName.trim()) {
        newErrors.recipientName = "Vui lòng nhập tên người nhận!";
      }

      if (!bankInfo.bankName.trim()) {
        newErrors.bankName = "Vui lòng nhập tên ngân hàng!";
      }

      if (!bankInfo.accountNumber.trim()) {
        newErrors.accountNumber = "Vui lòng nhập số tài khoản!";
      }

      if (!bankInfo.phone.trim()) {
        newErrors.phone = "Vui lòng nhập số điện thoại!";
      } else if (!/^[0-9]{10}$/.test(bankInfo.phone.replace(/\s/g, ""))) {
        newErrors.phone = "Số điện thoại phải có đúng 10 chữ số!";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setCurrentStep(3);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setShowCancellationLoading(true);
    try {
      // Gọi API tạo yêu cầu hủy
      await cancellationRequestService.createCancellationRequest({
        booking_id: bookingData.id,
        cancel_reason: cancelReason,
        recipient_name: bankInfo.recipientName,
        bank_name: bankInfo.bankName,
        account_number: bankInfo.accountNumber,
        phone_number: bankInfo.phone,
      });
      // Cập nhật trạng thái booking
      await bookingService.updateBookingStatus(
        bookingData.id,
        "refund_requested"
      );

      // Hiển thị thông báo thành công và chuyển hướng sau 2 giây
      setTimeout(() => {
        setShowCancellationLoading(false);
        toast.success("Yêu cầu hủy đặt tour đã được gửi thành công!");
        navigate("/user/my-bookings");
      }, 2000);
    } catch (error) {
      setShowCancellationLoading(false);
      toast.error("Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-blue-900 mb-4">
          Thông tin tour muốn hủy
        </h3>
        <div className="space-y-3">
          <p>
            <span className="font-medium">Tour:</span>{" "}
            {bookingData?.schedule?.tour?.title || bookingData?.tourTitle || ""}
          </p>
          <p>
            <span className="font-medium">Ngày khởi hành:</span>{" "}
            {bookingData?.schedule?.start_date || bookingData?.startDate}
          </p>
          <p>
            <span className="font-medium">Tổng tiền:</span>{" "}
            {(
              (bookingData?.total || bookingData?.totalAmount || 0) as number
            ).toLocaleString()}{" "}
            VND
          </p>
          <p>
            <span className="font-medium">Số ngày còn lại:</span>{" "}
            <span className="text-blue-600 font-semibold">
              {refundInfo.daysUntilTour} ngày
            </span>
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Chính sách hoàn tiền
        </h3>

        <div className="space-y-4">
          {refundRates.map((policy, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${
                (refundInfo.daysUntilTour >= policy.from_day &&
                  policy.to_day >= refundInfo.daysUntilTour) ||
                (policy.to_day === 0 && refundInfo.daysUntilTour < 4)
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  Hủy{" "}
                  {policy.from_day === 0 && policy.to_day === 3
                    ? "dưới 4 ngày"
                    : policy.from_day === 4 && policy.to_day === 6
                    ? "4-6 ngày"
                    : policy.from_day === 7 && policy.to_day === 14
                    ? "7-14 ngày"
                    : policy.from_day === 15 && policy.to_day === 365
                    ? "15 ngày hoặc hơn"
                    : `${policy.from_day}-${policy.to_day} ngày`}{" "}
                  trước ngày khởi hành:
                </span>
                <span
                  className={`font-bold text-lg ${
                    parseFloat(policy.refund_percentage) > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatPercent(policy.refund_percentage)} hoàn tiền
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">
            Áp dụng cho tour của bạn:
          </h4>
          <div className="text-lg">
            <span className="text-gray-700">Số tiền hoàn lại: </span>
            <span
              className={`font-bold text-xl ${
                refundInfo.refundAmount > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {refundInfo.refundAmount.toLocaleString()} VND
            </span>
            <span className="text-gray-600 ml-2">
              ({formatPercent(refundInfo.refundPercentage)} của{" "}
              {(
                (bookingData?.total || bookingData?.totalAmount || 0) as number
              ).toLocaleString()}{" "}
              VND)
            </span>
          </div>
        </div>

        {refundInfo.refundPercentage === 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">
              ⚠️ Rất tiếc, tour của bạn không thể được hoàn tiền theo chính sách
              của chúng tôi.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-green-900 mb-2">
          Thông tin hoàn tiền
        </h3>
        <p className="text-green-700">
          Số tiền sẽ được hoàn:{" "}
          <span className="font-bold text-xl">
            {refundInfo.refundAmount.toLocaleString()} VND
          </span>
        </p>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Thông tin người nhận tiền
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do hủy tour *
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.cancelReason ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Nhập lý do hủy tour..."
              rows={3}
            />
            {errors.cancelReason && (
              <p className="mt-1 text-sm text-red-600">{errors.cancelReason}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {commonReasons.map((reason, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCancelReason(reason)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên người nhận *
            </label>
            <input
              type="text"
              value={bankInfo.recipientName}
              onChange={(e) =>
                setBankInfo((prev) => ({
                  ...prev,
                  recipientName: e.target.value,
                }))
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.recipientName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Nhập tên chủ tài khoản ngân hàng"
            />
            {errors.recipientName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.recipientName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên ngân hàng *
            </label>
            <BankSelector
              value={bankInfo.bankName}
              onChange={(bankName) =>
                setBankInfo((prev) => ({ ...prev, bankName }))
              }
              placeholder="Tìm kiếm và chọn ngân hàng..."
            />
            {errors.bankName && (
              <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số tài khoản *
            </label>
            <input
              type="text"
              value={bankInfo.accountNumber}
              onChange={(e) =>
                setBankInfo((prev) => ({
                  ...prev,
                  accountNumber: e.target.value,
                }))
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.accountNumber ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Nhập số tài khoản ngân hàng"
            />
            {errors.accountNumber && (
              <p className="mt-1 text-sm text-red-600">
                {errors.accountNumber}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại *
            </label>
            <input
              type="tel"
              value={bankInfo.phone}
              onChange={(e) =>
                setBankInfo((prev) => ({ ...prev, phone: e.target.value }))
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Số điện thoại để liên hệ xác nhận"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700 text-sm">
            <strong>Lưu ý:</strong> Vui lòng kiểm tra kỹ thông tin ngân hàng.
            Chúng tôi sẽ chuyển tiền hoàn lại trong vòng 3-5 ngày làm việc sau
            khi duyệt yêu cầu.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-yellow-900 mb-4">
          Xác nhận thông tin hủy đặt tour
        </h3>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded border">
            <h4 className="font-semibold text-gray-800 mb-2">
              Thông tin tour:
            </h4>
            <p>
              <span className="font-medium">Tour:</span>{" "}
              {bookingData?.schedule?.tour?.title ||
                bookingData?.tourTitle ||
                ""}
            </p>
            <p>
              <span className="font-medium">Ngày khởi hành:</span>{" "}
              {bookingData?.schedule?.start_date || bookingData?.startDate}
            </p>
            <p>
              <span className="font-medium">Tổng tiền gốc:</span>{" "}
              {(
                (bookingData?.total || bookingData?.totalAmount || 0) as number
              ).toLocaleString()}{" "}
              VND
            </p>
          </div>

          <div className="bg-white p-4 rounded border">
            <h4 className="font-semibold text-gray-800 mb-2">
              Lý do hủy tour:
            </h4>
            <p>
              <span className="font-medium">Lý do:</span> {cancelReason}
            </p>
          </div>

          <div className="bg-white p-4 rounded border">
            <h4 className="font-semibold text-gray-800 mb-2">
              Thông tin hoàn tiền:
            </h4>
            <p>
              <span className="font-medium">Tỷ lệ hoàn tiền:</span>{" "}
              {formatPercent(refundInfo.refundPercentage)}
            </p>
            <p>
              <span className="font-medium text-green-600">
                Số tiền hoàn lại:
              </span>
              <span className="text-green-600 font-bold text-lg ml-1">
                {refundInfo.refundAmount.toLocaleString()} VND
              </span>
            </p>
          </div>

          <div className="bg-white p-4 rounded border">
            <h4 className="font-semibold text-gray-800 mb-2">
              Thông tin người nhận:
            </h4>
            <p>
              <span className="font-medium">Tên người nhận:</span>{" "}
              {bankInfo.recipientName}
            </p>
            <p>
              <span className="font-medium">Ngân hàng:</span>{" "}
              {bankInfo.bankName}
            </p>
            <p>
              <span className="font-medium">Số tài khoản:</span>{" "}
              {bankInfo.accountNumber}
            </p>
            <p>
              <span className="font-medium">Số điện thoại:</span>{" "}
              {bankInfo.phone}
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">
            ⚠️ Sau khi xác nhận, yêu cầu hủy đặt tour không thể hoàn tác. Vui
            lòng kiểm tra kỹ thông tin trước khi gửi.
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
            <h1 className="text-2xl font-bold">Yêu cầu hủy đặt tour</h1>
            <p className="text-red-100 mt-2">
              Vui lòng đọc kỹ chính sách hoàn tiền trước khi tiếp tục
            </p>
          </div>

          {/* Progress indicator */}
          <div className="bg-gray-50 p-4">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep
                        ? "bg-red-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-16 h-1 mx-2 ${
                        step < currentStep ? "bg-red-500" : "bg-gray-200"
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
            {isLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[200px]">
                <svg
                  className="animate-spin h-8 w-8 text-red-500 mb-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
                <span className="text-gray-500">
                  Đang tải thông tin đặt tour...
                </span>
              </div>
            ) : (
              <>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="bg-gray-50 p-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <button
                onClick={() => navigate("/user/my-bookings")}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto"
              >
                Hủy
              </button>

              <div className="flex flex-col sm:flex-row gap-3">
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto"
                  >
                    Bước trước
                  </button>
                )}

                {currentStep < 3 ? (
                  <button
                    onClick={handleNext}
                    disabled={
                      currentStep === 1 && refundInfo.refundPercentage === 0
                    }
                    className={`px-6 py-2 rounded-md font-medium transition-colors w-full sm:w-auto ${
                      currentStep === 1 && refundInfo.refundPercentage === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                  >
                    Tiếp tục
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`px-6 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 w-full sm:w-auto ${
                      isSubmitting
                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    {isSubmitting && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {isSubmitting ? "Đang gửi..." : "Xác nhận hủy đặt tour"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay loading khi đang xử lý hủy tour */}
      {showCancellationLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mb-6"></div>
          <div className="text-lg font-semibold text-red-600">
            Đang xử lý yêu cầu hủy tour...
          </div>
          <div className="text-gray-500 mt-2">
            Vui lòng không tắt trình duyệt hoặc rời khỏi trang này.
          </div>
        </div>
      )}
    </div>
  );
};

export default CancelBooking;
