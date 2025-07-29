import { providerBookingApi } from "../../apis/provider/providerBooking.api";
import type { ProviderBookingsResponse } from "../../apis/provider/providerBooking.api";

export const providerBookingService = {
  getProviderBookings: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    tour_id?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<ProviderBookingsResponse> => {
    return providerBookingApi.getProviderBookings(params);
  },
};
