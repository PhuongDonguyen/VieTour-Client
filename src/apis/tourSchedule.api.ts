import axiosInstance from "./axiosInstance";

export interface TourSchedule {
  id: number;
  tour_id: number;
  start_date: string;
  participant: number;
  status: "available" | "full" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface TourScheduleQueryParams {
  page?: number;
  limit?: number;
  tour_id?: number;
  status?: "available" | "full" | "cancelled";
  provider_id?: number;
}

export interface TourScheduleResponse {
  success: boolean;
  data: TourSchedule[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface TourScheduleCreateResponse {
  success: boolean;
  message: string;
  data: TourSchedule;
}

export interface TourScheduleUpdateResponse {
  success: boolean;
  message: string;
  data: TourSchedule;
}

export interface TourScheduleDeleteResponse {
  success: boolean;
  message: string;
}

// New interface for remaining schedules count
export interface RemainingScheduleCount {
  tour_id: number;
  remaining_schedules: number;
}

export interface RemainingSchedulesResponse {
  success: boolean;
  data: RemainingScheduleCount[];
}

// Tour summary for schedule listing
export interface ScheduleTourSummary {
  id: number;
  title: string;
  poster_url: string;
  duration: string;
  location: string;
  provider_id: number;
}

export interface TourScheduleWithTour extends TourSchedule {
  tour: ScheduleTourSummary;
}

export interface TourSchedulePagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface TourScheduleWithTourResponse {
  success: boolean;
  data: TourScheduleWithTour[];
  pagination: TourSchedulePagination;
}

// Booking list for a schedule
export interface ScheduleBookingUser {
  id: number;
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar: string | null;
}

export interface ScheduleBookingPayment {
  id: number;
  payment_method: string;
  thumbnail: string;
}

export interface ScheduleBookingDetail {
  id: number;
  adult_quanti: number;
  kid_quanti: number;
  adult_price: number;
  kid_price: number;
  note: string;
}

export interface ScheduleBooking {
  id: number;
  user_id: number;
  schedule_id: number;
  total: number;
  status: string;
  payment_id: number;
  txn_ref: string | null;
  create_at: string;
  is_reviewed: boolean;
  client_name: string;
  client_phone: string | null;
  note: string;
  user: ScheduleBookingUser;
  payment: ScheduleBookingPayment;
  booking_details: ScheduleBookingDetail[];
}

export interface ScheduleBookingsPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ScheduleBookingsResponse {
  success: boolean;
  data: ScheduleBooking[];
  pagination?: ScheduleBookingsPagination; // Optional vì khi không có page/limit thì không có pagination
}

export const getAllTourSchedules = (params?: TourScheduleQueryParams) =>
  axiosInstance.get("/api/tour-schedules", { params });

export const getTourScheduleById = (id: number) =>
  axiosInstance.get(`/api/tour-schedules/${id}`);

export const createTourSchedule = (data: {
  tour_id: number;
  start_date: string;
  participant: number;
}) => axiosInstance.post("/api/tour-schedules", data);

export const updateTourSchedule = (
  id: number,
  data: {
    start_date?: string;
    status?: "available" | "full" | "cancelled";
  }
) => axiosInstance.put(`/api/tour-schedules/${id}`, data);

export const deleteTourSchedule = (id: number) =>
  axiosInstance.delete(`/api/tour-schedules/${id}`);

// New API function for getting remaining schedules count
export const getRemainingSchedulesCount =
  async (): Promise<RemainingSchedulesResponse> => {
    const { data } = await axiosInstance.get(
      "/api/tour-schedules/remaining-count"
    );
    return data;
  };

// Get schedules with tour info and pagination
export const getPaginatedTourSchedules = (
  params?: TourScheduleQueryParams,
  provider_id?: number
) =>
  axiosInstance.get<TourScheduleWithTourResponse>("/api/tour-schedules", {
    params: {
      ...(params || {}),
      ...(provider_id !== undefined && { provider_id }),
    },
  });

// Get bookings for a schedule (includes booking_details in response)
/**
 * Lấy danh sách bookings của một schedule
 * Response bao gồm booking_details với thông tin adult_quanti, kid_quanti, adult_price, kid_price
 * @param schedule_id - ID của schedule
 * @param page - Số trang (optional, nếu không truyền thì lấy full danh sách)
 * @param limit - Số lượng items mỗi trang (optional, nếu không truyền thì lấy full danh sách)
 * @returns Response chứa data là array ScheduleBooking[], mỗi booking có booking_details[]
 */
export const getScheduleBookings = (
  schedule_id: number,
  page?: number,
  limit?: number
) => {
  const params: Record<string, number> = {};
  if (page !== undefined) params.page = page;
  if (limit !== undefined) params.limit = limit;
  
  return axiosInstance.get<ScheduleBookingsResponse>(
    `/api/tour-schedules/${schedule_id}/bookings`,
    {
      params: Object.keys(params).length > 0 ? params : undefined,
    }
  );
};

