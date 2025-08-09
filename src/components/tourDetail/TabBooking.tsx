import React, { useState, useEffect } from "react";
import { fetchAllTourSchedules } from "@/services/tourSchedule.service";
import { fetchUserProfile } from "@/services/userProfile.service";
import { bookingService } from "@/services/booking.service";
import { paymentService } from "@/services/payment.service";
import { resourcesService } from "@/services/resources.service";
import {
  processPayment,
  getPaymentMethodDisplayName,
} from "@/services/paymentGateway.service";
import { getTourPricesByTourIdAndDate } from "@/apis/tourPrice.api";
import { useAuth } from "@/hooks/useAuth";
import Modal from "@/components/Modal";
import LoginForm from "@/components/authentication/LoginForm";
import SignupForm from "@/components/authentication/SignupForm";
import { TourCalendar } from "@/components/tourDetail/TourCalendar";
import type { BookingRequest, BookingDetail } from "@/apis/booking.api";
import type { PaymentMethod } from "@/apis/payment.api";
import { toast } from "sonner";

// Constants - có thể tùy chỉnh theo business logic
const BOOKING_CONSTANTS = {
  DEFAULT_TOUR_CAPACITY: 25,
  DEFAULT_DURATION: "3 ngày 2 đêm",
  MIN_BOOKING_DAYS_AHEAD: 2, // Đặt tour trước ít nhất 2 ngày
  LOCALSTORAGE_EXPIRY_HOURS: 24, // 24 giờ
  RESTORE_MESSAGE_TIMEOUT: 5000, // 5 giây
  TOTAL_STEPS: 5, // Giữ nguyên 5 bước
};

interface TabBookingProps {
  tourId: number;
  tourTitle: string;
  tourPrice: string;
  tourCapacity: number;
  duration?: string;
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

export const TabBooking: React.FC<TabBookingProps> = ({
  tourId,
  tourTitle,
  tourCapacity,
  duration = BOOKING_CONSTANTS.DEFAULT_DURATION,
}) => {
  const { user } = useAuth();

  // Validation for required props
  if (!tourCapacity || tourCapacity <= 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
        <div className="text-center py-12">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-red-600 mb-2">
              Lỗi dữ liệu tour
            </h3>
            <p className="text-gray-600">
              Không thể tải thông tin sức chứa của tour. Vui lòng thử lại sau.
            </p>
          </div>
        </div>
      </div>
    );
  }
  const [currentStep, setCurrentStep] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [priceOptions, setPriceOptions] = useState<PriceOption[]>([]);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    number | null
  >(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirectingToPayment, setIsRedirectingToPayment] = useState(false);
  const [wasLoggedOut, setWasLoggedOut] = useState(false);
  const [formData, setFormData] = useState({
    // Bước 1: Thông tin tour
    startDate: "",
    selectedScheduleId: null as number | null, // Thêm selectedScheduleId
    numDays: duration,
    selectedPrices: {} as Record<number, { adults: number; children: number }>,

    // Bước 3: Thông tin khách hàng
    customerName: "",
    phone: "",

    // Bước 4: Ghi chú và yêu cầu đặc biệt
    specialRequests: "",
  });
  const [showPaymentLoading, setShowPaymentLoading] = useState(false);
  const [showTourFullModal, setShowTourFullModal] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBookingPolicyModal, setShowBookingPolicyModal] = useState(false);
  const [bookingPolicy, setBookingPolicy] = useState("");
  const [isLoadingPolicy, setIsLoadingPolicy] = useState(false);

  // Key cho localStorage
  const getStorageKey = () => `booking_form_${tourId}`;

  // Xóa data khỏi localStorage khi hoàn thành booking
  const clearFormStorage = () => {
    localStorage.removeItem(getStorageKey());
  };

  // Xóa tất cả dữ liệu booking (khi logout)
  const clearAllBookingStorage = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("booking_form_")) {
        localStorage.removeItem(key);
      }
    });
  };

  // Effect để reset form khi component mount và user đã đăng nhập
  useEffect(() => {
    if (user) {
      // Nếu user vừa login lại sau khi logout, reset về bước 1
      if (wasLoggedOut) {
        console.log("User logged back in after logout, resetting to step 1");
        setCurrentStep(1);
        setFormData({
          startDate: "",
          selectedScheduleId: null,
          numDays: duration,
          selectedPrices: {},
          customerName: "",
          phone: "",
          specialRequests: "",
        });
        setSelectedPaymentMethod(null);
        setErrors({});
        setWasLoggedOut(false);
        // Clear any existing booking data
        clearAllBookingStorage();
        return;
      }

      // Luôn bắt đầu từ bước 1 khi reload trang (không khôi phục dữ liệu)
      console.log("Page loaded/reloaded, starting from step 1");
      setCurrentStep(1);
      setFormData({
        startDate: "",
        selectedScheduleId: null,
        numDays: duration,
        selectedPrices: {},
        customerName: "",
        phone: "",
        specialRequests: "",
      });
      setSelectedPaymentMethod(null);
      setErrors({});
      // Clear any existing booking data on page load
      clearAllBookingStorage();
    } else {
      // Khi user logout, đánh dấu đã logout và xóa tất cả dữ liệu booking
      setWasLoggedOut(true);
      clearAllBookingStorage();
      setCurrentStep(1);
      setFormData({
        startDate: "",
        selectedScheduleId: null,
        numDays: duration,
        selectedPrices: {},
        customerName: "",
        phone: "",
        specialRequests: "",
      });
      setSelectedPaymentMethod(null);
      setErrors({});
      console.log("User logged out, cleared all booking form data");
    }

    // Cleanup function để xóa dữ liệu khi component unmount nếu user không đăng nhập
    return () => {
      if (!user) {
        clearAllBookingStorage();
      }
    };
  }, [user, tourId, duration, wasLoggedOut]);

  // Cleanup refresh interval when component unmounts
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    };
  }, [refreshInterval]);

  // Effect để cập nhật numDays khi duration prop thay đổi
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      numDays: duration,
    }));
  }, [duration]);

  // Effect để cảnh báo khi người dùng reload trang nếu đã có dữ liệu
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Không cảnh báo nếu đang chuyển hướng sang trang thanh toán
      if (isRedirectingToPayment) {
        return;
      }

      // Chỉ cảnh báo nếu user đã đăng nhập và có dữ liệu trong form
      if (user && hasFormData()) {
        const message =
          "Bạn có chắc muốn rời khỏi trang? Dữ liệu đặt tour của bạn sẽ bị mất.";
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    // Thêm event listener
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [
    user,
    formData.startDate,
    currentStep,
    formData.selectedPrices,
    formData.customerName,
    formData.phone,
    formData.specialRequests,
    isRedirectingToPayment,
  ]);

  // Function để check xem có dữ liệu trong form không
  const hasFormData = () => {
    return (
      formData.startDate ||
      currentStep > 1 ||
      Object.keys(formData.selectedPrices).length > 0 ||
      formData.customerName ||
      formData.phone ||
      formData.specialRequests
    );
  };

  // Function to check if date is valid (at least MIN_BOOKING_DAYS_AHEAD days from today)
  const isValidBookingDate = (dateString: string) => {
    const today = new Date();
    const bookingDate = new Date(dateString + "T00:00:00"); // Ensure proper parsing in local timezone
    const minDaysFromNow = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + BOOKING_CONSTANTS.MIN_BOOKING_DAYS_AHEAD
    );

    // Reset time components for accurate date-only comparison
    const bookingDateOnly = new Date(
      bookingDate.getFullYear(),
      bookingDate.getMonth(),
      bookingDate.getDate()
    );
    const minDateOnly = new Date(
      minDaysFromNow.getFullYear(),
      minDaysFromNow.getMonth(),
      minDaysFromNow.getDate()
    );

    console.log(
      `isValidBookingDate: ${dateString} -> booking: ${bookingDateOnly.toLocaleDateString()}, min: ${minDateOnly.toLocaleDateString()}, valid: ${
        bookingDateOnly >= minDateOnly
      }`
    );

    return bookingDateOnly >= minDateOnly;
  };

  // Load tour schedules trước
  useEffect(() => {
    const loadTourSchedules = async () => {
      try {
        setIsRefreshing(true);
        console.log("Loading tour schedules for tourId:", tourId);
        const schedulesData = await fetchAllTourSchedules({
          tour_id: tourId,
          page: 1,
          limit: 1000,
        });
        console.log("Tour schedules data:", schedulesData);

        // Filter chỉ lấy những ngày từ 2 ngày sau ngày hiện tại
        const validDates = schedulesData.data.filter((date: AvailableDate) =>
          isValidBookingDate(date.start_date)
        );
        setAvailableDates(validDates);
        console.log("Available dates set (filtered):", validDates);
      } catch (error) {
        console.error("Error loading tour schedules:", error);
        setAvailableDates([]);
      } finally {
        setIsRefreshing(false);
      }
    };

    // Load schedules immediately
    loadTourSchedules();

    // Set up auto-refresh every 1 minute (60000ms)
    const interval = setInterval(() => {
      console.log("Auto-refreshing tour schedules...");
      loadTourSchedules();
    }, 10000); // 1 minute

    setRefreshInterval(interval);

    // Cleanup function to clear interval when component unmounts or tourId changes
    return () => {
      if (interval) {
        clearInterval(interval);
        setRefreshInterval(null);
      }
    };
  }, [tourId]);

  // Load prices khi chuyển sang bước 2 và đã chọn ngày
  useEffect(() => {
    const loadTourPrices = async () => {
      if (currentStep === 2 && formData.startDate) {
        try {
          console.log(
            "Loading tour prices for tourId:",
            tourId,
            "date:",
            formData.startDate
          );
          const response: any = await getTourPricesByTourIdAndDate(
            tourId,
            formData.startDate
          );
          console.log("Tour prices response:", response);
          console.log("Response data:", response.data);

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

          console.log("Parsed price data:", priceData);

          if (priceData && priceData.length > 0) {
            console.log("Setting price options:", priceData);
            setPriceOptions(priceData);

            // Initialize selectedPrices với default values
            const initialPrices: Record<
              number,
              { adults: number; children: number }
            > = {};
            priceData.forEach((_, index) => {
              initialPrices[index] = { adults: 0, children: 0 };
            });
            setFormData((prev) => ({ ...prev, selectedPrices: initialPrices }));
            console.log("Price options set, length:", priceData.length);
          } else {
            console.log("No data found in response");
            setPriceOptions([]);
          }
        } catch (error) {
          console.error("Error loading tour prices:", error);
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
            setFormData((prev) => ({
              ...prev,
              customerName: `${first_name} ${last_name}`.trim(),
              phone: phone || "",
            }));
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
          // Không cần làm gì nếu không load được profile
        }
      };

      loadUserProfile();
    }
  }, [currentStep]);

  // Load payment methods khi vào bước 5
  useEffect(() => {
    if (currentStep === 5) {
      const loadPaymentMethods = async () => {
        try {
          console.log("Loading payment methods...");
          const response = await paymentService.getPaymentMethods();
          console.log("Payment methods response:", response);

          if (response.success) {
            setPaymentMethods(response.data);
            console.log("Payment methods loaded:", response.data);
            // Auto select first payment method if available
            if (response.data.length > 0 && !selectedPaymentMethod) {
              setSelectedPaymentMethod(response.data[0].id);
            }
          } else {
            console.log("Payment methods API returned success: false");
            setPaymentMethods([]);
          }
        } catch (error) {
          console.error("Error loading payment methods:", error);
          setPaymentMethods([]);
        }
      };

      loadPaymentMethods();
    }
  }, [currentStep, selectedPaymentMethod]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateSelect = (dateString: string) => {
    handleInputChange("startDate", dateString);
    // Reset selectedScheduleId khi chọn ngày mới
    handleInputChange("selectedScheduleId", null);
  };

  const handleScheduleSelect = (scheduleId: number) => {
    handleInputChange("selectedScheduleId", scheduleId);
  };

  const handleNext = () => {
    // Clear previous errors
    setErrors({});

    // Kiểm tra validation cho từng bước
    if (currentStep === 1) {
      // Bước 1: Phải chọn ngày khởi hành và tour_schedule
      if (!formData.startDate) {
        setErrors({ startDate: "Vui lòng chọn ngày khởi hành!" });
        return;
      }

      // Kiểm tra xem có nhiều tour_schedule cho ngày này không
      const schedulesForDate = availableDates.filter(
        (date) => date.start_date === formData.startDate
      );

      if (schedulesForDate.length > 1 && !formData.selectedScheduleId) {
        setErrors({ schedule: "Vui lòng chọn lịch trình cụ thể!" });
        return;
      }

      // Nếu chỉ có 1 schedule, tự động chọn
      if (schedulesForDate.length === 1 && !formData.selectedScheduleId) {
        handleInputChange("selectedScheduleId", schedulesForDate[0].id);
      }
    }

    if (currentStep === 2) {
      // Bước 2: Phải có ít nhất 1 người lớn
      const totalPeople = getTotalPeople();
      if (totalPeople.totalAdults === 0) {
        setErrors({ quantity: "Phải có ít nhất 1 người lớn!" });
        return;
      }

      // Kiểm tra capacity
      const selectedSchedule = availableDates.find(
        (date) => date.id === formData.selectedScheduleId
      );
      if (selectedSchedule) {
        const totalSelected =
          totalPeople.totalAdults + totalPeople.totalChildren;
        const remainingCapacity = tourCapacity - selectedSchedule.participant;

        if (totalSelected > remainingCapacity) {
          setErrors({
            capacity: `Số lượng khách đã chọn (${totalSelected}) vượt quá số vé còn lại (${remainingCapacity})!`,
          });
          return;
        }
      }
    }

    if (currentStep === 3) {
      // Bước 3: Kiểm tra thông tin liên hệ
      const newErrors: Record<string, string> = {};

      if (!formData.customerName.trim()) {
        newErrors.customerName = "Vui lòng nhập họ và tên!";
      }

      if (!formData.phone.trim()) {
        newErrors.phone = "Vui lòng nhập số điện thoại!";
      } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ""))) {
        newErrors.phone = "Số điện thoại phải có đúng 10 chữ số!";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }

    if (currentStep === 4) {
      // Bước 4: Không có validation bắt buộc cho ghi chú
      // User có thể để trống ghi chú
    }

    if (currentStep === 5) {
      // Bước 5: Kiểm tra phương thức thanh toán
      if (!selectedPaymentMethod) {
        setErrors({ paymentMethod: "Vui lòng chọn phương thức thanh toán!" });
        return;
      }
    }

    if (currentStep < BOOKING_CONSTANTS.TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // First, fetch and show booking policy
    const policy = await fetchBookingPolicy();

    // Show booking policy modal even if policy is empty (user can still proceed)
    setShowBookingPolicyModal(true);
  };

  const handleConfirmBooking = async () => {
    setIsRedirectingToPayment(true);
    setIsSubmitting(true);
    setShowPaymentLoading(true);
    setShowBookingPolicyModal(false);

    try {
      // Sử dụng selectedScheduleId đã chọn
      if (!formData.selectedScheduleId) {
        toast.error("Không tìm thấy lịch trình đã chọn!");
        setIsRedirectingToPayment(false); // Reset state khi có lỗi
        return;
      }

      // Debug: Kiểm tra schedule_id có hợp lệ không
      console.log("Debug - selectedScheduleId:", formData.selectedScheduleId);
      console.log("Debug - availableDates:", availableDates);

      // Kiểm tra xem schedule_id có tồn tại trong availableDates không
      const selectedSchedule = availableDates.find(
        (date) => date.id === formData.selectedScheduleId
      );

      if (!selectedSchedule) {
        console.error(
          "Schedule not found in availableDates:",
          formData.selectedScheduleId
        );
        toast.error("Lịch trình đã chọn không hợp lệ!");
        setIsRedirectingToPayment(false);
        return;
      }

      console.log("Debug - selectedSchedule:", selectedSchedule);

      // Đảm bảo schedule_id không null
      if (!formData.selectedScheduleId) {
        toast.error("Lịch trình đã chọn không hợp lệ!");
        setIsRedirectingToPayment(false);
        return;
      }

      // Tạo booking_details từ selectedPrices
      const bookingDetails: BookingDetail[] = [];
      Object.entries(formData.selectedPrices).forEach(
        ([priceIndex, quantities]) => {
          const priceOption = priceOptions[parseInt(priceIndex)];
          if (
            priceOption &&
            (quantities.adults > 0 || quantities.children > 0)
          ) {
            bookingDetails.push({
              adult_quanti: quantities.adults,
              kid_quanti: quantities.children,
              adult_price: priceOption.adult_price,
              kid_price: priceOption.kid_price,
              note: priceOption.note,
            });
          }
        }
      );

      // Tạo booking request data
      const bookingData: BookingRequest = {
        schedule_id: formData.selectedScheduleId!, // Non-null assertion since we validated above
        total: calculateTotalPrice(),
        client_name: formData.customerName,
        client_phone: formData.phone,
        note: formData.specialRequests || "",
        payment_id: selectedPaymentMethod!, // Non-null assertion since we validated above
        booking_details: bookingDetails,
      };

      console.log("Sending booking data:", bookingData);
      console.log("Debug - schedule_id type:", typeof bookingData.schedule_id);
      console.log("Debug - schedule_id value:", bookingData.schedule_id);

      // Validation thêm cho các trường khác
      console.log("Debug - client_name:", bookingData.client_name);
      console.log("Debug - client_phone:", bookingData.client_phone);
      console.log("Debug - total:", bookingData.total);
      console.log("Debug - payment_id:", bookingData.payment_id);
      console.log("Debug - booking_details:", bookingData.booking_details);

      // Kiểm tra độ dài các trường text
      if (bookingData.client_name.length > 100) {
        toast.error("Tên khách hàng quá dài!");
        setIsRedirectingToPayment(false);
        return;
      }

      if (bookingData.client_phone.length > 20) {
        toast.error("Số điện thoại quá dài!");
        setIsRedirectingToPayment(false);
        return;
      }

      if (bookingData.note.length > 500) {
        toast.error("Ghi chú quá dài!");
        setIsRedirectingToPayment(false);
        return;
      }

      // Gửi API request
      const response = await bookingService.createBooking(bookingData);

      console.log("Booking response:", response);

      // Get the selected payment method details
      const selectedMethod = paymentMethods.find(
        (m) => m.id === selectedPaymentMethod
      );

      if (!selectedMethod) {
        toast.error("Không tìm thấy phương thức thanh toán!");
        setIsRedirectingToPayment(false); // Reset state khi có lỗi
        return;
      }

      // Process payment using the payment gateway service
      const paymentResult = await processPayment(selectedMethod, {
        amount: bookingData.total,
        orderInfo: `Đặt tour: ${tourTitle} - ${formData.customerName} - ${formData.phone}`,
        bookingId: response.data?.id,
      });

      if (paymentResult.success && paymentResult.payUrl) {
        toast.success("Đang chuyển hướng đến cổng thanh toán...");
        window.location.href = paymentResult.payUrl;
        // Không tắt loading ở đây, chỉ tắt nếu có lỗi
      } else {
        setShowPaymentLoading(false);
        // Show error message with toast instead of alert
        const errorMessage =
          paymentResult.error || "Đã có lỗi xảy ra trong quá trình thanh toán.";
        toast.error(errorMessage);
        console.error("Payment processing failed:", paymentResult.error);
        setIsRedirectingToPayment(false); // Reset state khi có lỗi thanh toán
        return;
      }

      // Xóa dữ liệu form khỏi localStorage khi thành công
      clearFormStorage();

      // Reset form về trạng thái ban đầu
      setCurrentStep(1);
      setFormData({
        startDate: "",
        selectedScheduleId: null,
        numDays: duration,
        selectedPrices: {},
        customerName: "",
        phone: "",
        specialRequests: "",
      });
      setSelectedPaymentMethod(null);
    } catch (error: any) {
      setShowPaymentLoading(false);
      console.error("Error creating booking:", error);

      // Check for specific error code 9003 (Tour is full)
      if (error.response?.data?.errorCode === 9003) {
        setShowTourFullModal(true);
        return;
      }

      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại");
    } finally {
      setIsSubmitting(false);
      // Reset redirect state nếu có lỗi
      setIsRedirectingToPayment(false);
    }
  };

  const handlePriceChange = (
    priceIndex: number,
    type: "adults" | "children",
    value: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      selectedPrices: {
        ...prev.selectedPrices,
        [priceIndex]: {
          ...prev.selectedPrices[priceIndex],
          [type]: value,
        },
      },
    }));
  };

  const calculateTotalPrice = () => {
    let total = 0;
    Object.entries(formData.selectedPrices).forEach(
      ([priceIndex, quantities]) => {
        const priceOption = priceOptions[parseInt(priceIndex)];
        if (priceOption) {
          total +=
            quantities.adults * priceOption.adult_price +
            quantities.children * priceOption.kid_price;
        }
      }
    );
    return total;
  };

  // Function để test schedule_id

  const getTotalPeople = () => {
    let totalAdults = 0;
    let totalChildren = 0;

    Object.values(formData.selectedPrices).forEach((quantities) => {
      totalAdults += quantities.adults || 0;
      totalChildren += quantities.children || 0;
    });

    return { totalAdults, totalChildren };
  };

  // Fetch booking policy
  const fetchBookingPolicy = async () => {
    setIsLoadingPolicy(true);
    try {
      const policy = await resourcesService.getResourceContent(
        "booking_policy"
      );
      setBookingPolicy(policy);
      return policy;
    } catch (error) {
      console.error("Error fetching booking policy:", error);
      toast.error("Không thể tải chính sách đặt tour!");
      return "";
    } finally {
      setIsLoadingPolicy(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Refresh indicator */}
            {isRefreshing && (
              <div className="flex items-center justify-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Đang cập nhật thông tin tour...</span>
              </div>
            )}

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

            {/* Hiển thị tour schedules nếu đã chọn ngày */}
            {formData.startDate && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Chọn lịch trình cụ thể
                </h3>

                {(() => {
                  const schedulesForDate = availableDates.filter(
                    (date) => date.start_date === formData.startDate
                  );

                  if (schedulesForDate.length === 0) {
                    return (
                      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
                        Không có lịch trình nào cho ngày này.
                      </div>
                    );
                  }

                  if (schedulesForDate.length === 1) {
                    // Tự động chọn nếu chỉ có 1 schedule
                    if (!formData.selectedScheduleId) {
                      handleInputChange(
                        "selectedScheduleId",
                        schedulesForDate[0].id
                      );
                    }
                    return (
                      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                        <p className="font-medium">
                          Lịch trình đã được chọn tự động
                        </p>
                        <p className="text-sm">
                          Ngày: {formData.startDate} | Số vé còn lại:{" "}
                          {tourCapacity - schedulesForDate[0].participant}
                        </p>
                      </div>
                    );
                  }

                  // Hiển thị danh sách schedules nếu có nhiều
                  return (
                    <div className="space-y-3">
                      {schedulesForDate.map((schedule) => {
                        const remainingCapacity =
                          tourCapacity - schedule.participant;
                        const isSelected =
                          formData.selectedScheduleId === schedule.id;
                        const isDisabled = remainingCapacity === 0;

                        return (
                          <div
                            key={schedule.id}
                            className={`p-4 border rounded-lg transition-all ${
                              isDisabled
                                ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-60"
                                : isSelected
                                ? "border-orange-500 bg-orange-50 cursor-pointer"
                                : "border-gray-200 hover:border-orange-300 cursor-pointer"
                            }`}
                            onClick={() => {
                              if (!isDisabled) {
                                handleScheduleSelect(schedule.id);
                              }
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p
                                  className={`font-medium ${
                                    isDisabled
                                      ? "text-gray-500"
                                      : "text-gray-800"
                                  }`}
                                >
                                  Lịch trình #{schedule.id}
                                </p>
                                <p
                                  className={`text-sm ${
                                    isDisabled
                                      ? "text-gray-400"
                                      : "text-gray-600"
                                  }`}
                                >
                                  Ngày: {schedule.start_date}
                                </p>
                              </div>
                              <div className="text-right">
                                <p
                                  className={`text-sm font-medium ${
                                    isDisabled
                                      ? "text-red-600"
                                      : "text-gray-800"
                                  }`}
                                >
                                  {isDisabled
                                    ? "Hết vé"
                                    : `Còn lại: ${remainingCapacity} vé`}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Đã đặt: {schedule.participant} người
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {errors.schedule && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {errors.schedule}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Chọn số lượng khách
            </h3>

            {formData.startDate && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Ngày khởi hành:</span>{" "}
                  {formData.startDate}
                </p>
                {formData.selectedScheduleId && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold">Lịch trình:</span> #
                    {formData.selectedScheduleId}
                  </p>
                )}
              </div>
            )}

            {/* Bảng giá cho từng loại */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">
                Chọn số lượng khách cho từng loại giá:
              </h4>

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
                <div className="space-y-4">
                  {/* Skeleton Loading */}
                  {[1, 2].map((skeleton) => (
                    <div
                      key={skeleton}
                      className="bg-gray-50 p-4 rounded-lg border animate-pulse"
                    >
                      {/* Title skeleton */}
                      <div className="h-5 bg-gray-300 rounded w-32 mb-3"></div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        {/* Price info skeleton */}
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-40"></div>
                          <div className="h-4 bg-gray-300 rounded w-36"></div>
                        </div>

                        {/* Adult input skeleton */}
                        <div>
                          <div className="h-4 bg-gray-300 rounded w-20 mb-1"></div>
                          <div className="h-10 bg-gray-300 rounded w-full"></div>
                        </div>

                        {/* Children input skeleton */}
                        <div>
                          <div className="h-4 bg-gray-300 rounded w-16 mb-1"></div>
                          <div className="h-10 bg-gray-300 rounded w-full"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                priceOptions.map((option, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                    <h5 className="font-semibold text-gray-800 mb-3 capitalize">
                      {option.note}
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div>
                        <div className="text-sm text-gray-600">
                          Giá người lớn:{" "}
                          <span className="font-semibold">
                            {option.adult_price.toLocaleString()} VND
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Giá trẻ em:{" "}
                          <span className="font-semibold">
                            {option.kid_price.toLocaleString()} VND
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số người lớn
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.selectedPrices[index]?.adults || 0}
                          onChange={(e) =>
                            handlePriceChange(
                              index,
                              "adults",
                              parseInt(e.target.value) || 0
                            )
                          }
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
                          onChange={(e) =>
                            handlePriceChange(
                              index,
                              "children",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    {/* Tính tổng cho loại giá này */}
                    {(formData.selectedPrices[index]?.adults > 0 ||
                      formData.selectedPrices[index]?.children > 0) && (
                      <div className="mt-3 p-2 bg-white rounded border">
                        <div className="text-sm">
                          Tổng cho {option.note}:{" "}
                          <span className="font-semibold text-orange-600">
                            {(
                              (formData.selectedPrices[index]?.adults || 0) *
                                option.adult_price +
                              (formData.selectedPrices[index]?.children || 0) *
                                option.kid_price
                            ).toLocaleString()}{" "}
                            VND
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
                  <span className="font-semibold">
                    {getTotalPeople().totalAdults} người lớn,{" "}
                    {getTotalPeople().totalChildren} trẻ em
                  </span>
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
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Thông tin liên hệ
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) =>
                    handleInputChange("customerName", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.customerName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Họ và tên sẽ được tự động điền từ profile của bạn"
                />
                {errors.customerName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.customerName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Số điện thoại sẽ được tự động điền từ profile của bạn"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Ghi chú và yêu cầu đặc biệt
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú và yêu cầu đặc biệt
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) =>
                  handleInputChange("specialRequests", e.target.value)
                }
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
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Xác nhận thông tin đặt tour
            </h3>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 className="font-semibold text-gray-800">Thông tin tour:</h4>
              <p>
                <span className="font-medium">Tour ID:</span> {tourId}
              </p>
              <p>
                <span className="font-medium">Tour:</span> {tourTitle}
              </p>
              <p>
                <span className="font-medium">Ngày khởi hành:</span>{" "}
                {formData.startDate}
              </p>
              <p>
                <span className="font-medium">Thời gian:</span>{" "}
                {formData.numDays}
              </p>

              <div className="mt-4">
                <h5 className="font-medium text-gray-800 mb-2">
                  Chi tiết đặt chỗ:
                </h5>
                {priceOptions.map((option, index) => {
                  const quantities = formData.selectedPrices[index];
                  if (
                    quantities &&
                    (quantities.adults > 0 || quantities.children > 0)
                  ) {
                    return (
                      <div key={index} className="ml-4 text-sm">
                        <p>
                          <span className="font-medium capitalize">
                            {option.note}:
                          </span>{" "}
                          {quantities.adults} người lớn, {quantities.children}{" "}
                          trẻ em
                        </p>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>

              <p>
                <span className="font-medium">Tổng số khách:</span>{" "}
                {getTotalPeople().totalAdults} người lớn,{" "}
                {getTotalPeople().totalChildren} trẻ em
              </p>
              <p>
                <span className="font-medium">Tổng giá tour:</span>{" "}
                <span className="text-xl font-bold text-orange-600">
                  {calculateTotalPrice().toLocaleString()} VND
                </span>
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 className="font-semibold text-gray-800">
                Thông tin liên hệ:
              </h4>
              <p>
                <span className="font-medium">Họ tên:</span>{" "}
                {formData.customerName}
              </p>
              <p>
                <span className="font-medium">Số điện thoại:</span>{" "}
                {formData.phone}
              </p>
            </div>

            {formData.specialRequests && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-gray-800">
                  Ghi chú và yêu cầu đặc biệt:
                </h4>
                <p>{formData.specialRequests}</p>
              </div>
            )}

            {/* Payment Method Selection */}
            <div className="bg-white border border-gray-200 p-4 rounded-lg space-y-4">
              <h4 className="font-semibold text-gray-800 text-lg">
                Chọn phương thức thanh toán:
              </h4>

              {errors.paymentMethod && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {errors.paymentMethod}
                </div>
              )}

              {paymentMethods.length === 0 ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((skeleton) => (
                    <div
                      key={skeleton}
                      className="flex items-center p-3 border border-gray-200 rounded-lg animate-pulse"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-300 rounded"></div>
                        </div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 rounded w-32"></div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                        selectedPaymentMethod === method.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedPaymentMethod === method.id}
                        onChange={() => setSelectedPaymentMethod(method.id)}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="flex-shrink-0">
                          <img
                            src={method.thumbnail}
                            alt={method.payment_method}
                            className="w-8 h-8 object-contain rounded"
                          />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">
                            {getPaymentMethodDisplayName(method.payment_method)}
                          </span>
                        </div>
                        <div className="flex-shrink-0">
                          <div
                            className={`w-4 h-4 rounded-full border-2 ${
                              selectedPaymentMethod === method.id
                                ? "border-orange-500 bg-orange-500"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedPaymentMethod === method.id && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Hiển thị form đăng nhập nếu chưa đăng nhập */}
      {!user || user?.role !== "user" ? (
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
          {/* Cảnh báo mất dữ liệu */}
          {hasFormData() && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">
                  <strong>Lưu ý:</strong> Dữ liệu đặt tour sẽ bị mất nếu bạn tải
                  lại trang (F5) hoặc đóng trình duyệt. Hãy hoàn thành đặt tour
                  để tránh mất dữ liệu.
                </span>
              </div>
            </div>
          )}

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {Array.from(
                { length: BOOKING_CONSTANTS.TOTAL_STEPS },
                (_, i) => i + 1
              ).map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step}
                  </div>
                  {step < BOOKING_CONSTANTS.TOTAL_STEPS && (
                    <div
                      className={`w-12 h-1 mx-1 ${
                        step < currentStep ? "bg-orange-500" : "bg-gray-200"
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
          <div className="mb-8">{renderStep()}</div>

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`px-6 py-2 rounded-md font-medium ${
                  currentStep === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                }`}
              >
                Quay lại
              </button>
            </div>

            {currentStep < BOOKING_CONSTANTS.TOTAL_STEPS ? (
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
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isSubmitting ? "Đang xử lý..." : "Xem chính sách & Đặt tour"}
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

      {/* Modal Tour Full */}
      <Modal
        isOpen={showTourFullModal}
        onClose={() => setShowTourFullModal(false)}
      >
        <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tour đã đầy
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Rất tiếc, tour này đã đạt sức chứa tối đa. Vui lòng chọn lịch tour
              khác hoặc liên hệ với chúng tôi để được hỗ trợ.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowTourFullModal(false);
                  setCurrentStep(1); // Go back to step 1 to select different date
                }}
                className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-600 transition-colors"
              >
                Chọn ngày khác
              </button>
              <button
                onClick={() => setShowTourFullModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Booking Policy */}
      {showBookingPolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowBookingPolicyModal(false)}
          />

          {/* Modal content */}
          <div className="relative z-10 w-full max-w-4xl bg-white rounded-lg shadow-xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Chính sách đặt tour
              </h3>
              <p className="text-gray-600">
                Vui lòng đọc kỹ chính sách đặt tour trước khi xác nhận
              </p>
            </div>

            {isLoadingPolicy ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-2 text-gray-600">
                  Đang tải chính sách...
                </span>
              </div>
            ) : (
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-6">
                {bookingPolicy ? (
                  <div dangerouslySetInnerHTML={{ __html: bookingPolicy }} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Không có thông tin chính sách đặt tour.
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowBookingPolicyModal(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-400 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  isSubmitting
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isSubmitting ? "Đang xử lý..." : "Xác nhận đặt tour"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay loading khi chờ giao dịch */}
      {showPaymentLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mb-6"></div>
          <div className="text-lg font-semibold text-orange-600">
            Đang chuyển hướng đến cổng thanh toán...
          </div>
          <div className="text-gray-500 mt-2">
            Vui lòng không tắt trình duyệt hoặc rời khỏi trang này.
          </div>
        </div>
      )}
    </>
  );
};
