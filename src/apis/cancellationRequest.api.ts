import axiosInstance from "./axiosInstance";

export interface CancellationRequest {
  id: number;
  booking_id: number;
  request_date: string;
  cancel_reason: string;
  refund_percentage: number;
  refund_amount: number;
  status: string;
  created_at: string;
  updated_at: string | null;
  transaction_image: string | null;
  recipient_name: string;
  bank_name: string;
  account_number: string;
  phone_number: string;
  booking: any;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CancellationRequestsResponse {
  success: boolean;
  data: CancellationRequest[];
  pagination?: PaginationInfo;
  message?: string;
}

export interface CancellationRequestResponse {
  success: boolean;
  data: CancellationRequest;
  message?: string;
}

// Utility function to convert UTC time to UTC+7
export const convertToUTC7 = (utcTime: string): string => {
  const date = new Date(utcTime);
  const utc7Date = new Date(date.getTime() + 7 * 60 * 60 * 1000); // Add 7 hours
  return utc7Date.toISOString();
};

// Utility function to format date for display in UTC+7
export const formatDateUTC7 = (utcTime: string): string => {
  const date = new Date(utcTime);
  const utc7Date = new Date(date.getTime() + 7 * 60 * 60 * 1000); // Add 7 hours
  return utc7Date.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// Lấy tất cả yêu cầu hủy của user
export const getMyCancellationRequests = async (
  query?: string
): Promise<CancellationRequestsResponse> => {
  const url = "/api/cancellation-requests/my-requests" + (query || "");
  const response = await axiosInstance.get(url);
  return response.data;
};

// Lấy chi tiết 1 yêu cầu hủy
export const getCancellationRequestById = async (
  id: number
): Promise<CancellationRequestResponse> => {
  const response = await axiosInstance.get(`/api/cancellation-requests/${id}`);
  return response.data;
};

// Tạo yêu cầu hủy
export const createCancellationRequest = async (data: {
  booking_id: number;
  cancel_reason: string;
  recipient_name: string;
  bank_name: string;
  account_number: string;
  phone_number: string;
}): Promise<CancellationRequestResponse> => {
  const response = await axiosInstance.post("/api/cancellation-requests", data);
  return response.data;
};

// Cập nhật yêu cầu hủy (chỉ cho phép khi pending)
export const updateCancellationRequest = async (
  id: number,
  data: {
    cancel_reason: string;
  }
): Promise<CancellationRequestResponse> => {
  const response = await axiosInstance.put(
    `/api/cancellation-requests/${id}`,
    data
  );
  return response.data;
};

// Lấy tất cả yêu cầu hoàn tiền (admin và provider sẽ tự động filter theo role)
export const getAllCancellationRequests = async (
  query?: string
): Promise<CancellationRequestsResponse> => {
  const url = "/api/cancellation-requests" + (query || "");
  const response = await axiosInstance.get(url);
  return response.data;
};

// Admin cập nhật trạng thái và ảnh giao dịch cho yêu cầu hoàn tiền
export const updateCancellationRequestStatus = async (
  id: number,
  data: { status: string; transaction_image?: File }
): Promise<CancellationRequestResponse> => {
  const formData = new FormData();
  formData.append("status", data.status);
  if (data.transaction_image) {
    formData.append("transaction_image", data.transaction_image);
  }
  const response = await axiosInstance.put(
    `/api/cancellation-requests/${id}/status`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
};

// Hoàn tiền booking khi hủy tour schedule (insufficient passengers)
export const refundBookingForInsufficientPassengers = async (data: {
  booking_id: number;
  recipient_name: string;
  bank_name: string;
  account_number: string;
  phone_number: string;
  transaction_image: File;
}): Promise<CancellationRequestResponse> => {
  const formData = new FormData();
  formData.append("booking_id", data.booking_id.toString());
  formData.append("recipient_name", data.recipient_name);
  formData.append("bank_name", data.bank_name);
  formData.append("account_number", data.account_number);
  formData.append("phone_number", data.phone_number);
  formData.append("transaction_image", data.transaction_image);

  const response = await axiosInstance.post(
    "/api/cancellation-requests/insufficient-passengers",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
};