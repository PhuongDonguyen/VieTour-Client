import axiosInstance from "./axiosInstance";

export interface BookingDetail {
  adult_quanti: number;
  kid_quanti: number;
  adult_price: number;
  kid_price: number;
  note: string;
}

export interface BookingRequest {
  schedule_id: number;
  total: number;
  client_name: string;
  client_phone: string;
  note: string;
  payment_id: number;
  booking_details: BookingDetail[];
}

// Admin booking types
export interface Tour {
  id: number;
  title: string;
  poster_url: string;
  provider_id: number;
  capacity: number;
  transportation: string;
  accommodation: string;
  destination_intro: string;
  tour_info: string;
  view_count: string;
  slug: string;
  tour_category_id: number;
  is_active: boolean;
  total_star: number;
  review_count: number;
  live_commentary: string;
  duration: string;
  booked_count: number;
  provider?: Provider;
}

export interface Schedule {
  id: number;
  start_date: string;
  participant: number;
  status: string;
  tour_id: number;
  tour?: Tour;
}

export interface Provider {
  id: number;
  company_name: string;
  email: string;
  phone: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  phone: string | null;
  ward: string | null;
  district: string | null;
  province: string | null;
  address: string | null;
  avatar: string | null;
  account_id: number;
  is_verified: boolean;
}

export interface AdminBooking {
  id: number;
  user_id: number;
  schedule_id: number;
  total: number;
  status: string;
  payment_id: number;
  txn_ref: string;
  create_at: string;
  is_reviewed: boolean;
  client_name: string;
  client_phone: string;
  note: string;
  booking_details: BookingDetail[];
  schedule: Schedule;
  tour?: Tour;
  provider?: Provider;
  user?: User;
  // Additional fields from backend
  tour_title?: string;
  company_name?: string;
  tour_schedule?: {
    id: number;
    start_date: string;
    status: string;
  };
}

export const createBooking = (bookingData: BookingRequest) =>
  axiosInstance.post("/api/bookings", bookingData);

export const getMyBookings = (
  page: number = 1,
  limit: number = 5,
  status?: string
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (status && status !== "all") {
    params.append("status", status);
  }

  return axiosInstance.get(`/api/bookings/my-bookings?${params.toString()}`);
};

export const getBookingById = (id: number) =>
  axiosInstance.get(`/api/bookings/${id}`);

export const updateBookingStatus = (id: number, status: string) =>
  axiosInstance.put(`/api/bookings/${id}/status`, { status });

// Admin endpoints
export const getAllBookings = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  tour_id?: number;
  provider_id?: number;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}) => {
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
  }

  return axiosInstance.get(`/api/bookings?${searchParams.toString()}`);
};

export const getBookingsCount = (params?: {
  status?: string;
  tour_id?: number;
  provider_id?: number;
  start_date?: string;
  end_date?: string;
}) => {
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
  }

  return axiosInstance.get(`/api/bookings/count?${searchParams.toString()}`);
};
