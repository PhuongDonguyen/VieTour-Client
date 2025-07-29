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

export interface CancellationRequestsResponse {
  success: boolean;
  data: CancellationRequest[];
  message?: string;
}

export interface CancellationRequestResponse {
  success: boolean;
  data: CancellationRequest;
  message?: string;
}

// Lấy tất cả yêu cầu hủy của user
export const getMyCancellationRequests =
  async (): Promise<CancellationRequestsResponse> => {
    const response = await axiosInstance.get(
      "/api/cancellation-requests/my-requests"
    );
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
