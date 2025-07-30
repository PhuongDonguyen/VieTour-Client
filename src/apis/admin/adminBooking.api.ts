import axiosInstance from "../axiosInstance";

export interface BookingDetail {
  id: number;
  booking_id: number;
  adult_quanti: number;
  kid_quanti: number;
  adult_price: number;
  kid_price: number;
  note: string;
}

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
}

export interface Schedule {
  id: number;
  start_date: string;
  participant: number;
  status: string;
  tour_id: number;
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
  tour: Tour;
  provider: Provider;
  user: User;
}

export interface AdminBookingsResponse {
  success: boolean;
  data: AdminBooking[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const adminBookingApi = {
  getAdminBookings: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    provider_id?: number;
    tour_id?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<AdminBookingsResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.search) searchParams.append("search", params.search);
    if (params?.status) searchParams.append("status", params.status);
    if (params?.provider_id)
      searchParams.append("provider_id", params.provider_id.toString());
    if (params?.tour_id)
      searchParams.append("tour_id", params.tour_id.toString());
    if (params?.start_date)
      searchParams.append("start_date", params.start_date);
    if (params?.end_date) searchParams.append("end_date", params.end_date);

    const url = `/api/admin/bookings${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    return axiosInstance.get(url);
  },

  getAdminBookingById: (
    id: number
  ): Promise<{
    success: boolean;
    data: AdminBooking;
  }> => {
    return axiosInstance.get(`/api/admin/bookings/${id}`);
  },
};
