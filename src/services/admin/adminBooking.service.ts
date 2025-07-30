import { adminBookingApi } from "../../apis/admin/adminBooking.api";
import type { AdminBookingsResponse } from "../../apis/admin/adminBooking.api";

export const adminBookingService = {
  getAdminBookings: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    provider_id?: number;
    tour_id?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<AdminBookingsResponse> => {
    return adminBookingApi.getAdminBookings(params);
  },

  getAdminBookingById: async (id: number) => {
    return adminBookingApi.getAdminBookingById(id);
  },
};
