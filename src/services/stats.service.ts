import {
  statsApi,
  TopTourStats,
  TopProviderStats,
  StatsQueryParams,
} from "@/apis/stats.api";

export interface StatsService {
  getTopToursByBookings: (params?: StatsQueryParams) => Promise<TopTourStats[]>;
  getTopProvidersByRevenue: (
    params?: StatsQueryParams
  ) => Promise<TopProviderStats[]>;
}

class StatsServiceImpl implements StatsService {
  async getTopToursByBookings(
    params?: StatsQueryParams
  ): Promise<TopTourStats[]> {
    try {
      const response = await statsApi.getTopToursByBookings(params);
      return response.data;
    } catch (error) {
      console.error("Error fetching top tours by bookings:", error);
      throw error;
    }
  }

  async getTopProvidersByRevenue(
    params?: StatsQueryParams
  ): Promise<TopProviderStats[]> {
    try {
      const response = await statsApi.getTopProvidersByRevenue(params);
      return response.data;
    } catch (error) {
      console.error("Error fetching top providers by revenue:", error);
      throw error;
    }
  }
}

export const statsService = new StatsServiceImpl();
